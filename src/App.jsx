import React from 'react';
import { ReactComponent as Logo } from './img/ean-generator-optimised.svg';
import excel from './img/2C1v9.png';
import Form from './Form';
import './css/App.css';

const App = function App() {
  return (
    <div>
      <header className="py-3 bg-orange-600 mb-5">
        <div className="container mx-auto">
          <Logo className="logo" />
        </div>
      </header>
      <section className="container mx-auto">
        <Form />
      </section>
      <section className="container mx-auto mt-5">
        <h1 className="text-2xl text-red-500 mb-3">
          REMEMBER - When opening in excel to set the column to text,
          <br />
          otherwise the leading 0&apos;s will be missing.
        </h1>
        <img src={excel} alt="Excel Opening" />
        <p className="mt-5 text-sm">
          The software is provided &quot;as is&quot;, without warranty of any kind, express or
          implied, including but not limited to the warranties of merchantability, fitness for a
          particular purpose and noninfringement. In no event shall the authors or copyright holders
          be liable for any claim, damages or other liability, whether in an action of contract,
          tort or otherwise, arising from, out of or in connection with the software or the use
          or other dealings in the software.
        </p>
      </section>
    </div>
  );
};

export default App;
