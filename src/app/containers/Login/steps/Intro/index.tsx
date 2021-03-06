import * as React from 'react';
const t = require('../../style.css');

class Intro extends React.Component<any, any> {
  public render() {
    return (
      <div className={t.loginStep}>
        <img
          width={102}
          height={102}
          src={require('./icon102.png')} />
        <h1>Telegram Desktop</h1>
        <p>
          Welcome to the official <a href="https://telegram.org">Telegram</a> desktop app.
        </p>
        <p>
          It's <strong>fast</strong> and <strong>secure</strong>.
        </p>
        <button onClick={this.props.nextStep} className={`${t.btn} ${t.primary}`}>Start messaging</button>
      </div>
    );
  }
}

export { Intro }
