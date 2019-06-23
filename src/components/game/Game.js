import React from 'react';
import './Game.scss';
import Board from '../board/Board';
import losemp3 from '../../assets/lose.mp3';
import githubcornerpng from '../../assets/github-corner.png';

class Game extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      playing: true,
      currentlyPlaying: null,
      message: 'Para começar, clique em "Iniciar jogo"',
      roundTimeout: 400,
      defaultToneGain: 0.005,
      started: false,
      correctExecution: [],
      currentExecution: [],
      increaseSpeedEachNRounds: 2,
      timesLost: 0,
      timesLostForPrank: 2,
      audioCtx: new (window.AudioContext || window.webkitAudioContext)()
    }

    var doubleTouchStartTimestamp = 0;
    document.addEventListener("touchstart", function (event) {
      var now = +(new Date());
      if (doubleTouchStartTimestamp + 500 > now) {
        event.preventDefault();
      };
      doubleTouchStartTimestamp = now;
    });
  }

  playNote(frequency, duration, gainValue, callback = null) {
    let oscillator = this.state.audioCtx.createOscillator();
    let gain = this.state.audioCtx.createGain();

    oscillator.type = 'square';
    oscillator.frequency.value = frequency;
    gain.gain.value = gainValue;

    console.log('Playing ' + frequency + 'Hz at gain ' + gainValue);

    oscillator.connect(gain);
    gain.connect(this.state.audioCtx.destination);

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();

      if (callback != null) {
        callback();
      }
    }, duration);
  }

  playMelody(notes, tempo, finalCallback = null) {
    if (notes.length > 0) {
      let note = notes.pop();

      let callback = () => {
        this.playMelody(notes, tempo, finalCallback);
      }

      this.playNote(note[0], 1000 * 256 / (note[1] * tempo), this.state.defaultToneGain, callback);
    }
    else {
      if (finalCallback != null) {
        finalCallback();
      }
    }
  }

  indexToFrequency(index) {
    return (100 * index) + 250;
  }

  showMessage(message) {
    this.setState({
      message: message
    });
  }

  isExecutingCorrectly(currentExecution, correctExecution) {
    return (JSON.stringify(currentExecution)) === (JSON.stringify(correctExecution.slice(0, currentExecution.length)));
  }

  handleClick(index) {
    if (this.state.playing === false && this.state.started === true) {
      let currentExecution = this.state.currentExecution.slice();
      let correctExecution = this.state.correctExecution.slice();

      currentExecution.push(index);

      if (this.isExecutingCorrectly(currentExecution, correctExecution)) {

        this.setState({
          playing: true,
          currentlyPlaying: index,
          currentExecution: currentExecution
        });

        let callback = () => {
          this.setState({
            playing: false,
            currentlyPlaying: null
          });

          const stillOngoing = this.state.currentExecution.length < this.state.correctExecution.length;

          if (stillOngoing === false) {
            // Display next random color;
            this.proceedExecution();
          }
        }

        this.playNote(this.indexToFrequency(index), 300, this.state.defaultToneGain, callback);
      }
      else {
        this.lose();
      }
    }
  }

  simulateClick(index, simulationCallback = null) {

    console.log('Simulating random index: ' + index);

    this.setState({
      currentlyPlaying: index,
    });

    let callback = () => {
      this.setState({
        currentlyPlaying: null
      });

      if (simulationCallback != null) {
        simulationCallback();
      }
    }

    this.playNote(this.indexToFrequency(index), this.state.roundTimeout, this.state.defaultToneGain, callback);
  }

  blink(times = null, speed = null, callback = null) {
    const b = () => {
      setTimeout(() => {
        this.setState({
          playing: !this.state.playing
        });

        if (times > 0 || times == null) {
          if (times != null) {
            times--;
          }

          b();
        }
        else if (callback) {
          callback()
        }
      }, speed || 500);
    }

    b();
  }

  proceedExecution() {
    let correctExecution = this.state.correctExecution.slice();

    let min = Math.ceil(0);
    let max = Math.floor(3);
    let random = Math.floor(Math.random() * (max - min + 1)) + min;

    correctExecution.push(random);

    this.setState({
      correctExecution: correctExecution.slice(),
      currentExecution: [],
      playing: true
    });

    let round = correctExecution.length;

    this.showMessage('Rodada ' + round + (round % this.state.increaseSpeedEachNRounds === 0 ? '<br />Mais rápido!' : ''));

    // Increases speed.
    if (round % this.state.increaseSpeedEachNRounds === 0) {
      this.setState({
        roundTimeout: this.state.roundTimeout - 50
      })
    }

    correctExecution.reverse();

    setTimeout(() => {
      const simulationCallback = () => {
        setTimeout(() => {

          if (correctExecution.length > 0) {
            this.simulateClick(correctExecution.pop(), simulationCallback);
          }
          else {
            this.setState({
              playing: false
            });
          }

        }, this.state.roundTimeout);
      }

      this.simulateClick(correctExecution.pop(), simulationCallback);
    }, this.state.roundTimeout * 2);
  }

  start() {
    let audio = document.getElementById("audio");

    if (audio.paused === false) {
      audio.pause();
      audio.currentTime = 0;
    }

    this.showMessage('');

    let tempo = 18;

    let startMelody = [
      [400, tempo],
      [500, tempo],
      [600, tempo],
      [700, tempo],
      [800, tempo],
      [900, tempo],
      [1000, tempo],
    ];

    startMelody.reverse();

    this.playMelody(startMelody, 100);

    const blinkCallback = () => {
      this.setState({
        playing: true,
        started: true
      });

      this.proceedExecution();
    }

    this.setState({
      playing: false,
      started: false,
      message: 'Iniciando nova partida',
      correctExecution: [],
      currentExecution: [],
      roundTimeout: 400,
    });

    this.blink(2, null, blinkCallback);
  }

  prank() {
    window.addEventListener('beforeunload', (event) => {
      event.returnValue = 'Foge não safado';
    });

    let audio = document.getElementById("audio");
    audio.volume = 1;
    audio.play();

    this.showMessage('Eita!');

    this.blink(null, 100);
  }

  lose() {
    const timesLosts = this.state.timesLost + 1;

    this.setState({
      timesLost: timesLosts
    });

    if (timesLosts % this.state.timesLostForPrank === 0) {
      this.prank();
    }
    else {
      let rounds = this.state.correctExecution.length;
      this.showMessage('Você errou :(<br />Sobreviveu ' + rounds + ' round' + (rounds > 1 ? 's' : ''));

      let loseMelody = [
        [50, 20],
        [0, 20],
        [50, 20],
        [0, 20],
        [50, 20],
        [0, 20],
        [50, 20]
      ];

      loseMelody.reverse();

      let loseMelody2 = loseMelody.map(x => x.map((y, i) => i === 0 ? y * 2 : y));
      let loseMelody3 = loseMelody.map(x => x.map((y, i) => i === 0 ? y * 3 : y));
      let loseMelody4 = loseMelody.map(x => x.map((y, i) => i === 0 ? y * 8 : y));

      this.playMelody(loseMelody, 100);
      this.playMelody(loseMelody2, 100);
      this.playMelody(loseMelody3, 100);
      this.playMelody(loseMelody4, 100);

      const blinkCallback = () => {
        this.setState({
          playing: true
        });
      }

      this.setState({
        playing: true,
        started: true
      });

      this.blink(3, null, blinkCallback);
    }
  }

  render() {
    return (
      <div className="game">
        <a href="https://github.com/edgarfroes/simon-says" target="_blank" rel="noopener noreferrer" className="github">
          <img src={githubcornerpng} alt="GitHub" />
        </a>
        <h1 className="output" dangerouslySetInnerHTML={{ __html: this.state.message }}></h1>
        <button className=
          {
            'startGame' +
            (this.state.timesLost > 0 && this.state.timesLost % this.state.timesLostForPrank === 0 ? ' lost-prank' : '')
          }
          onClick={() => this.start()}>
          {this.state.started === true ? 'Reiniciar jogo' : 'Iniciar jogo'}
        </button>
        <div className="board-container">
          <Board
            playing={this.state.playing}
            started={this.state.started}
            currentlyPlaying={this.state.currentlyPlaying}
            onClick={(i) => this.handleClick(i)} />
        </div>
        <audio id="audio">
          <source src={losemp3}></source>
        </audio>
      </div>
    )
  };
}

export default Game;