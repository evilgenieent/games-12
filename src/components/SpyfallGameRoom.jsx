import React from 'react';
import PropTypes from 'prop-types';
import Firebase from 'firebase';
import _ from 'lodash';
import globals from '../globals.js'
import RoleList from './RoleList.jsx';
import YourInfo from './YourInfo.jsx';
import jsonfile from 'jsonfile';
import rolesJson from '../roles.json';

const propTypes = {
  roomCode: PropTypes.string.isRequired,
  playerName: PropTypes.string.isRequired,
  players: PropTypes.array.isRequired,
};

const SPY = 'Spy';
const VILLAGER = 'Villager';

export default class SpyfallGameRoom extends React.Component {
  constructor() {
    super();

    this.state = {
      gameState: {
        isPaused: false,
      },
    }
  }

  // this is the controlling player. it is the player that corresponds to this browser
  getCurrentPlayer() {
    return this.props.players.find(p =>
      p.playerName === this.props.playerName
    );
  }

  amIEvil() {
    return this.getCurrentPlayer().role === SPY;
  }

  amIGood() {
    return !this.amIEvil();
  }

  componentDidMount() {
    console.log('CS- this.props:');
    console.log(this.props);

    const gameStateRef = new Firebase(`https://avalon-online-53e63.firebaseio.com/games/${this.props.roomCode}`);
    gameStateRef.on("value", snapshot => {
      this.setState(snapshot.val())
    });

    this.setInitialGameState();
  }

  setInitialGameState() {
    const gameStateRef = new Firebase(`https://avalon-online-53e63.firebaseio.com/games/${this.props.roomCode}/gameState`);
    gameStateRef.once("value", (snapshot) => {
      const gameState = snapshot.val();
      if (!gameState || !gameState.isPaused) {
        gameStateRef.update({isPaused: false});
      }

      window.history.pushState({}, "Spyfall",
        "http://localhost:3001/?spyfall=true&debug=true&playerName=" + this.props.playerName
        + "&roomCode=" + this.props.roomCode
      );
    });
  }

  updateCurrentState(updatedState) {
    const gameStateRef = new Firebase(`https://avalon-online-53e63.firebaseio.com/games/${this.props.roomCode}/gameState`);
    gameStateRef.update(updatedState);
  }

  // the game state that is always displayed
  getPermanentGameStateDiv() {
    if (!this.state.gameState) return null;

    return (
      <div>
        <div>
          Current Time: {this.state.gameState.startTime}
          {
            Object.keys(rolesJson).map(location => {
              return (
                <span>{location}</span>
              );
            })
          }
        </div>
      </div>
    );
  }

  sortedPlayers() {
    return this.props.players.sort((p1, p2) => {
      return p1.playerName.localeCompare(p2.playerName);
    });
  }

  setGameMessage(s, messageType = globals.MESSAGE_NEUTRAL) {
    this.updateCurrentState({
      gameMessage: s,
      gameMessageType: messageType,
    });
  }

  setNextActionMessage(s) {
    this.updateCurrentState({
      nextActionMessage: s,
    });
  }

  getPlayerList() {
    let players = [];

    this.sortedPlayers().forEach( player => {
      players.push(
        <div className="checkbox-div">
          <input type="checkbox" name="??" value={ player.playerName } onClick={this.selectedPlayer.bind(this, player.playerName)}
            checked={this.playerIsAProposedPlayer(player.playerName) ? true : false} className='checkbox'/>
          <span className={"checkboxtext" + (true ? " bold" : "")} onClick={this.selectedPlayer.bind(this, player.playerName)}>
            { player.playerName }
          </span>
          <br/>
        </div>
      );
    });

    return (
      <form>
        { players }
      </form>
    );
  }

  render() {
    console.log('CS- this.state2:');
    console.log(this.state);

    return (
      <div className={"outer-div"}>
      <div className="inner-div">
        <h1>Spyfall Game Room: {this.props.roomCode}</h1>
        <span>
          There are { this.props.players.filter(p => {
            return globals.roleIsEvil(p.role)
          }).length } spies total
        </span>
        { this.getPermanentGameStateDiv() }
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <br/>
        <h2>Your name is: <span className='bold'>{ this.props.playerName }</span></h2>
        <h2>Your role is: <span className='bold'>{ this.getCurrentPlayer() && this.getCurrentPlayer().role }</span></h2>
      </div>
      </div>
    );
  }
}

SpyfallGameRoom.propTypes = propTypes;
