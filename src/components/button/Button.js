import React from 'react';
import './Button.scss';

class Button extends React.Component {
    render() {
        return (
            <div className="button-container">
                <button
                    className=
                    {
                        'color-' +
                        this.props.index +
                        (this.props.playing === true ? ' playing' : '') +
                        (this.props.started === false ? ' not-started' : '') +
                        (this.props.currentlyPlaying === true ? ' currently-playing' : '')
                    }
                    onClick={this.props.onClick}>
                    </button>
            </div>
        )
    }
}

export default Button;