import './App.css';
import React, { Component } from 'react';
import {Button, TableContainer} from "@material-ui/core";
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TableBody from '@material-ui/core/TableBody';
import Container from '@material-ui/core/Container';
import { Grid } from '@material-ui/core';
import TableHead from "@material-ui/core/TableHead";
var chiSquaredTest = require("chi-squared-test");


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sequence: [],
      calculated: false
    }
  }
  add_flip = (flip) => {
    this.setState({
      sequence: this.state.sequence.concat(flip)
    });
  }

  simulate_streaks = () => {
    const num_flips = this.state.sequence.length;
    let expected_streak_counts = new Array(4);
    if (Object.seal) {
      expected_streak_counts.fill(0);
      Object.seal(expected_streak_counts);
    }
    for (let i = 0; i < 10000; i++) {
      let prev = Math.floor(Math.random() + 0.5);
      let streak_length = 1;
      for (let j = 1; j < num_flips; j++) {
        let next = Math.floor(Math.random() + 0.5);
        if (next === prev) {
          streak_length += 1;
        } else {
          if (streak_length >= 4) {
            expected_streak_counts[3] += 1 / 10000;
          } else {
            expected_streak_counts[streak_length-1] += 1 / 10000;
          }
          streak_length = 1;
          prev = next;
        }
      }
      if (streak_length >= 4) {
        expected_streak_counts[3] += 1 / 10000;
      } else {
        expected_streak_counts[streak_length-1] += 1 / 10000;
      }
    }
    return expected_streak_counts;
  }
  calculate_streaks = () => {
    const num_flips = this.state.sequence.length;
    let streak_counts = new Array(4);
    if (Object.seal) {
      streak_counts.fill(0);
      Object.seal(streak_counts);
    }

    let prev = this.state.sequence[0];
    let streak_length = 1;
    for (let i = 1; i < num_flips; i++) {
      let next = this.state.sequence[i];
      if (next === prev) {
        streak_length += 1;
      } else {
        if (streak_length >= 4) {
          streak_counts[3] += 1;
        } else {
          streak_counts[streak_length-1] += 1;
        }
        streak_length = 1;
        prev = next;
      }
    }
    if (streak_length >= 4) {
      streak_counts[3] += 1;
    } else {
      streak_counts[streak_length-1] += 1;
    }
    return streak_counts;
  }

  compare_streaks = () => {
    let streak_counts = this.calculate_streaks();
    let expected_streak_counts = this.simulate_streaks();
    let enough = true;
    for (let i = 0;i < expected_streak_counts.length; i++) {
      if (expected_streak_counts[i] < 5) {
        enough = false;
        break;
      }
    }
    let p;
    if (enough) {
      p = chiSquaredTest(streak_counts, expected_streak_counts, 1).probability;
    }
    this.setState({
      streak_counts: streak_counts,
      expected_streak_counts: expected_streak_counts,
      streaks_p: p,
      streaks_p_found: enough
    })


  }

  transition_matrix = () => {
    const num_flips = this.state.sequence.length;
    let heads_to_tails = 0;
    let tails_to_heads = 0;
    let heads_to_heads = 0;
    let tails_to_tails = 0;
    let prev = this.state.sequence[0];
    for (let i = 1; i < num_flips; i++) {
      const this_roll = this.state.sequence[i];
      if (prev === 0) {
        if (this_roll === 0) {
          heads_to_heads += 1;
        }
        else {
          heads_to_tails += 1;
        }
      } else {
        if (this_roll === 0) {
          tails_to_heads += 1;
        } else {
          tails_to_tails += 1;
        }
      }
      prev = this_roll;
    }
    let p;

    if (num_flips >= 20) {
      const expected = [num_flips/4, num_flips/4, num_flips/4, num_flips/4];
      const actual = [heads_to_heads, heads_to_tails, tails_to_heads, tails_to_tails];
      p = chiSquaredTest(actual, expected, 1).probability;
    }


    this.setState({
      heads_to_heads: heads_to_heads,
      heads_to_tails: heads_to_tails,
      tails_to_heads: tails_to_heads,
      tails_to_tails: tails_to_tails,
      transition_matrix_p: p,
      transition_matrix_p_found: num_flips >= 20
    });
  }


  check_flips = () => {
    this.transition_matrix();
    this.compare_streaks();
    this.setState({
      calculated: true
    });
  }

  reset = () => {
    this.setState({
      sequence: [],
      heads_to_heads: undefined,
      heads_to_tails: undefined,
      tails_to_heads: undefined,
      tails_to_tails: undefined,
      transition_matrix_p: undefined,
      calculated: false
    });
  }

  render() {
    return (
        <Container maxWidth={"sm"}>
          <h3 style={{textAlign: "center"}}>How random are you really?</h3>
          <p style={{textAlign: "center"}}>Pretend to flip some coins.</p>
          <Grid container item xs={4} justify="center" style={{marginLeft: "33%"}}>
            <Button onClick={() => this.add_flip(0)}>Heads</Button><Button onClick={() => this.add_flip(1)}>Tails</Button><Button onClick={this.check_flips}>Check</Button><Button onClick={this.reset}>Reset</Button>
            <span>Number of flips: {this.state.sequence.length}</span>
            <i>Try to get 100</i>
          </Grid>
          {this.state.calculated ?
              <div>
                <h3 style={{textAlign: "center"}}>Transition Matrix</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell> </TableCell><TableCell>Heads</TableCell><TableCell>Tails</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Heads</TableCell><TableCell>{this.state.heads_to_heads}</TableCell><TableCell>{this.state.heads_to_tails}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tails</TableCell><TableCell>{this.state.tails_to_heads}</TableCell><TableCell>{this.state.tails_to_tails}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <br/>
                {this.state.transition_matrix_p_found ?
                  <span>Chi-squared GOF p-value: {this.state.transition_matrix_p}{this.state.transition_matrix_p > 0.05 ? "✅" : "❌"}
                  <br/>
                    {this.state.transition_matrix_p > 0.05 ? "You seem pretty random!": "You aren't very random. Sad."}
                  </span> :
                    <span>Not enough flips to run a Chi-squared test.</span>
                }
                <h3 style={{textAlign: "center"}}>Streaks Analysis</h3>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Streak Length</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>4+</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Observed</TableCell>
                      <TableCell>{this.state.streak_counts[0]}</TableCell>
                      <TableCell>{this.state.streak_counts[1]}</TableCell>
                      <TableCell>{this.state.streak_counts[2]}</TableCell>
                      <TableCell>{this.state.streak_counts[3]}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Expected</TableCell>
                      <TableCell>{this.state.expected_streak_counts[0].toFixed(2)}</TableCell>
                      <TableCell>{this.state.expected_streak_counts[1].toFixed(2)}</TableCell>
                      <TableCell>{this.state.expected_streak_counts[2].toFixed(2)}</TableCell>
                      <TableCell>{this.state.expected_streak_counts[3].toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                {this.state.streaks_p_found ?
                    <span>Chi-squared GOF p-value: {this.state.streaks_p}{this.state.streaks_p> 0.05 ? "✅" : "❌"}
                      <br/>
                      {this.state.streaks_p > 0.05 ? "You seem pretty random!": "You aren't very random. Sad."}
                  </span> :
                    <span>Not enough flips to run a Chi-squared test.</span>
                }

              </div> :
              null
          }
        </Container>
    );
  }
}

export default App;
