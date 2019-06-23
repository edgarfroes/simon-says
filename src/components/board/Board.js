import React from 'react';
import './Board.scss';
import Button from '../button/Button';

class Board extends React.Component {
  renderButton(i) {
    return (
      <Button
        index={i}
        playing={this.props.playing}
        started={this.props.started}
        currentlyPlaying={this.props.currentlyPlaying === i}
        onClick={() => this.props.onClick(i)}
        />
    );
  }

  render() {
    return (
      <div className="board">
        <div className="row">
          <div className="item">
            {this.renderButton(0)}
          </div>
          <div className="item">
            {this.renderButton(1)}
          </div>
        </div>
        <div className="row">
          <div className="item">
            {this.renderButton(2)}
          </div>
          <div className="item">
            {this.renderButton(3)}
          </div>
        </div>
      </div>
    )
  };
}

export default Board;