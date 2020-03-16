import React, { Component } from "react";
import "../styles/app.css";

class App extends Component {
  constructor(props) {
    super(props);

    this.handleResetButton = this.handleResetButton.bind(this);

    // Assign random symbol to computer and player
    const randomBoolean = Math.random() >= 0.5;
    this.state = {
      playerSymbol: randomBoolean ? "X" : "O",
      computerSymbol: !randomBoolean ? "X" : "O",
      board: ["", "", "", "", "", "", "", "", ""]
    };
  }

  handleCellClick(index, keepPlaying) {
    // If the position is empty and the game isn't over yet
    // and the user selected between single or multiplayer
    if (this.state.board[index] === "" && keepPlaying === true) {
      let update_board = this.state.board;

      update_board[index] = this.state.playerSymbol;

      // Update the state
      this.setState({ board: update_board });

      let ai_index = this.find_best_move(update_board);
      if (ai_index !== -4) update_board[ai_index] = this.state.computerSymbol;

      this.setState({ board: update_board });
    }
  }

  handleResetButton() {
    this.setState({
      board: ["", "", "", "", "", "", "", "", ""]
    });
  }

  render() {
    // Find winner if any
    let { symbol = null, line = [] } = this.hasWinner(this.state.board);
    // wining line indices
    let [a, b, c] = line;

    // Check for draw
    let isDraw = !symbol && this.state.board.every(val => val);
    // Check if game is over
    let keepPlaying = symbol === null && !isDraw ? true : false;

    setTimeout(() => {
      if (symbol === this.state.computerSymbol) alert("You lose!");
      if (symbol === this.state.playerSymbol) alert("You win. Well Played!!");
      if (isDraw) alert("Its a draw!");
    }, 500);

    return (
      <div className="game">
        <h1>Your Symbol is {this.state.playerSymbol} </h1>
        <div className="board">
          {this.state.board.map((cell, index) => {
            const isWinIndex =
              symbol && (index === a || index === b || index === c);
            console.log(isWinIndex);
            return (
              <div
                className={isWinIndex ? "square win" : "square"}
                key={index}
                onClick={() => this.handleCellClick(index, keepPlaying)}
              >
                {" "}
                {cell}{" "}
              </div>
            );
          })}
        </div>

        <button className="reset-button" onClick={this.handleResetButton}>
          Reset
        </button>
      </div>
    );
  }

  // Find winner
  hasWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    for (let i = 0; i < lines.length; i++) {
      let [a, b, c] = lines[i];
      if (
        squares[a] !== "" &&
        squares[a] === squares[b] &&
        squares[a] === squares[c] &&
        squares[b] === squares[c]
      )
        return { symbol: squares[a], line: [a, b, c] };
    }

    return {};
  }

  arrayToMat(squares) {
    let mat = [];
    let k = 0;

    for (let i = 0; i < 3; i++) {
      mat[i] = [];
      for (let j = 0; j < 3; j++) mat[i][j] = squares[k++];
    }

    return mat;
  }

  hasMovesLeft(mat) {
    // If it has an empty space, keep playing
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (mat[i][j] === "") return true;
      }
    }

    return false;
  }

  evaluate(mat, depth) {
    // Check every row
    for (let i = 0; i < 3; i++) {
      if (
        mat[i][0] === mat[i][1] &&
        mat[i][0] === mat[i][2] &&
        mat[i][1] === mat[i][2]
      ) {
        if (mat[i][0] === this.state.computerSymbol) return 100 - depth;
        if (mat[i][0] === this.state.playerSymbol) return depth - 100;
      }
    }

    // Check every col
    for (let j = 0; j < 3; j++) {
      if (
        mat[0][j] === mat[1][j] &&
        mat[0][j] === mat[2][j] &&
        mat[1][j] === mat[2][j]
      ) {
        if (mat[0][j] === this.state.computerSymbol) return 100 - depth;
        if (mat[0][j] === this.state.playerSymbol) return depth - 100;
      }
    }

    // Check the diagonals
    if (
      mat[0][0] === mat[1][1] &&
      mat[0][0] === mat[2][2] &&
      mat[1][1] === mat[2][2]
    ) {
      if (mat[0][0] === this.state.computerSymbol) return 100 - depth;
      if (mat[0][0] === this.state.playerSymbol) return depth - 100;
    }

    if (
      mat[0][2] === mat[1][1] &&
      mat[0][2] === mat[2][0] &&
      mat[1][1] === mat[2][0]
    ) {
      if (mat[0][2] === this.state.computerSymbol) return 100 - depth;
      if (mat[0][2] === this.state.playerSymbol) return depth - 100;
    }

    // If the game hasn't finished yet
    return 0;
  }

  minmax(mat, depth, get_max) {
    if (this.hasMovesLeft(mat) === false) {
      return this.evaluate(mat, depth);
    }

    let val = this.evaluate(mat, depth);

    if (val !== 0) return val;

    if (get_max) {
      let best = -Infinity;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (mat[i][j] === "") {
            mat[i][j] = this.state.computerSymbol;
            best = Math.max(best, this.minmax(mat, depth + 1, !get_max));
            mat[i][j] = "";
          }
        }
      }

      return best;
    } else {
      let best = Infinity;

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (mat[i][j] === "") {
            mat[i][j] = this.state.playerSymbol;
            best = Math.min(best, this.minmax(mat, depth + 1, !get_max));
            mat[i][j] = "";
          }
        }
      }

      return best;
    }
  }

  find_best_move(squares) {
    let mat = this.arrayToMat(squares);
    let val,
      row = -1,
      col = -1,
      best = -Infinity;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (mat[i][j] === "") {
          mat[i][j] = this.state.computerSymbol;
          val = this.minmax(mat, 0, false);
          mat[i][j] = "";

          if (val > best) {
            best = val;
            row = i;
            col = j;
          }
        }
      }
    }

    return 3 * row + col;
  }
}

export default App;
