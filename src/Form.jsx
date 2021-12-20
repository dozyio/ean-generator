import React from 'react';
import papaparse from 'papaparse';

class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      eanType: 'ean8',
      order: 'seq',
      amount: 100,
      start: '1',
      end: '9999999',
      output: '',
      ignoreArray: [],
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleEANChange = (event) => {
    switch (event.target.value) {
      case 'ean8':
        this.setState({
          end: '9999999',
        });
        break;

      case 'ean13':
        this.setState({
          end: '999999999999',
        });
        break;

      default:
        this.setState({
          output: 'Unknown EAN Type',
        });
        return;
    }

    this.handleInputChange(event);
  };

  handleIgnoreChange = (event) => {
    this.setState({
      ignoreArray: event.target.value.split(/\r?\n/),
    });
  };

  handleDownload = () => {
    const d = new Date();
    const fileName = `${d.toISOString()}.csv`;

    const { output } = this.state;
    const outputArray = output.split(/\r?\n/);
    const field = ['EAN Number'];
    const data = papaparse.unparse({
      fields: field,
      data: this.array2arrays(outputArray),
    });

    const file = new File([data], fileName, { type: 'text/csv' });
    const exportUrl = URL.createObjectURL(file);

    const fileLink = document.createElement('a');
    fileLink.href = exportUrl;
    fileLink.download = fileName;
    fileLink.click();
    URL.revokeObjectURL(exportUrl);
  };

  handleInputChange(event) {
    const value = event.target.type === 'checkbox'
      ? event.target.checked
      : event.target.value;
    const { name } = event.target;

    this.setState({
      [name]: value,
      output: '',
    });
  }

  clearIgnore = () => {
    this.setState({
      ignoreArray: [],
    });
  };

  validate = () => {
    const { start, end, amount } = this.state;

    if (
      Number(end) - Number(start) + 1 < amount
    ) {
      this.setState({
        output: `Start / End range is too small to generate ${amount} codes`,
      });
      return false;
    }

    return true;
  };

  generateOutput = () => {
    const { amount, ignoreArray } = this.state;
    if (!this.validate()) {
      return;
    }

    let outputNumber;
    let tries;
    const output = [];
    const maxTries = amount * 100;

    for (let i = 1; i <= amount; i += 1) {
      for (tries = 0; tries <= maxTries; tries += 1) {
        if (tries === maxTries) {
          this.setState({
            output: 'Couldn\'t generate enough random numbers',
          });
          return;
        }
        outputNumber = this.generateNumber(i + tries);
        if (
          outputNumber === false
          || ignoreArray.includes(outputNumber)
          || output.includes(outputNumber)
        ) {
          // eslint-disable-next-line no-continue
          continue;
        }
        break;
      }

      output.push(outputNumber);
    }

    this.setState({
      output: output.join('\n'),
    });
  };

  generateNumber = (i) => {
    const {
      order, start, end, eanType,
    } = this.state;
    let code;

    if (order === 'seq') {
      code = Number(start) + i - 1;
    } else {
      code = Math.floor(
        Math.random()
          * (Number(end) - Number(start) + 1)
          + Number(start),
      );
    }

    if (code < start || code > end) {
      return false;
    }

    switch (eanType) {
      case 'ean8':
        code = code.toString().padStart(7, '0');
        break;

      case 'ean13':
        code = code.toString().padStart(12, '0');
        break;

      default:
        this.setState({
          output: 'Unknown EAN Type',
        });
        return false;
    }

    const checkdigit = this.checksum(code.toString());

    return `${code}${checkdigit}`;
  };

  // eslint-disable-next-line class-methods-use-this
  array2arrays(arr) {
    const a = [];
    for (let i = 0; i < arr.length; i += 1) {
      a.push([arr[i]]);
    }
    return a;
  }

  // eslint-disable-next-line class-methods-use-this
  checksum(code) {
    const csum = code
      .split('')
      .reverse()
      .reduce((sum, char, idx) => {
        const digit = Number.parseInt(char, 10);
        const weight = (idx + 1) % 2 === 0 ? 1 : 3;
        const partial = digit * weight;
        return sum + partial;
      }, 0);

    const remainder = csum % 10;
    const checksum = remainder ? 10 - remainder : 0;

    return checksum;
  }

  render() {
    const {
      eanType, order, amount, start, end, ignoreArray, output,
    } = this.state;
    return (
      <>
        <p className="my-5">Generate EAN8 and EAN13 numbers with checksums</p>
        <section className="flex">
          <form className="flex-1 mr-5">
            <h2 className="text-2xl mb-3">Config</h2>
            <div className="mb-3">
              <label>
                Type:
                <select
                  name="eanType"
                  value={eanType}
                  onChange={
                      this.handleEANChange
                  }
                  className="border-2 ml-2 py-1 px-2"
                >
                  <option value="ean8">EAN8</option>
                  <option value="ean13">EAN13</option>
                </select>
              </label>
            </div>
            <div className="mb-3">
              <label>
                Ordering:
                <select
                  name="order"
                  value={order}
                  onChange={this.handleInputChange}
                  className="border-2 ml-2 py-1 px-2"
                >
                  <option value="seq">Sequential</option>
                  <option value="rand">Random</option>
                </select>
              </label>
            </div>
            <div className="mb-3">
              <label>
                Amount:
                <input
                  name="amount"
                  type="number"
                  value={amount}
                  onChange={this.handleInputChange}
                  className="border-2 ml-2 py-1 px-2"
                />
              </label>
            </div>
            <div className="mb-3">
              <label>
                Start:
                <input
                  name="start"
                  type="number"
                  value={start}
                  onChange={this.handleInputChange}
                  className="border-2 ml-2 py-1 px-2"
                />
              </label>
            </div>
            <div className="mb-3">
              <label>
                End:
                <input
                  name="end"
                  type="number"
                  value={end}
                  onChange={this.handleInputChange}
                  className="border-2 ml-2 py-1 px-2"
                />
              </label>
            </div>
            <div className="mb-3">
              <label>
                <p className="pb-2">Ignore these numbers:</p>
                <textarea
                  className="border-2 h-60 w-full"
                  onChange={this.handleIgnoreChange}
                  value={ignoreArray.join('\n')}
                />
              </label>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={this.clearIgnore}
                className="bg-gray-500 text-white p-2 hover:bg-orange-500"
              >
                Clear ignore numbers
              </button>
              <button
                type="button"
                onClick={this.generateOutput}
                className="bg-orange-500 text-white p-2"
              >
                Generate
              </button>
            </div>
          </form>
          <section className="flex-1">
            <h2 className="text-2xl mb-3">Output</h2>
            <textarea
              className="border-2 min-h-full w-full"
              value={output}
              disabled
            />
            <div className="text-right">
              <button
                type="button"
                className="bg-orange-500 text-white p-2 mt-3 "
                onClick={this.handleDownload}
              >
                Download
              </button>
            </div>
          </section>
        </section>
      </>
    );
  }
}

export default Form;
