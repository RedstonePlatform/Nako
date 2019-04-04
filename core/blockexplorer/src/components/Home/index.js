import React, { Component } from 'react';
import './style.css';
import '../../sbadmin2.css';
import Block from './../Block';
import { BrowserRouter as Router, Redirect, Route, Link } from 'react-router-dom'
import { Grid } from 'react-bootstrap'
//import { Grid, Row, Col, Table } from 'react-bootstrap'
import Moment from 'react-moment';

class Home extends Component {
    apiBaseUrl = '';

    constructor() {
        super();
        this.state={latestBlock:{}, blocks:[]};
        this.state.redirectUrl = null;
    }

    componentDidMount() {
        this.getLatestBlocks(15);
    }
    
    getLatestBlocks(numberOfBlocks) {
        fetch(`${this.apiBaseUrl}/api/query/block/latest`, { mode: 'cors' })
            .then(result => result.json())
            .then(latestBlock => this.setState({ latestBlock }))
            .then(async _ => {
                for (let i = 0; i < numberOfBlocks; i++) {
                    var currentTime = new Date().getTime();
                    while (currentTime + 10 >= new Date().getTime()) {
                        //stupid 10ms delay to help enforce order
                    }
                    let blockNum = this.state.latestBlock.blockIndex - i;

                    let url = `${this.apiBaseUrl}/api/query/block/Index/${blockNum}`;
                    await fetch(url, { mode: 'cors' })
                        .then(result => result.json())
                        .then(block => this.setState({ blocks: this.state.blocks.concat(block) }));
                }
            });
    }

    searchKeyPress = async e => {
        if(e.keyCode == 13){
            var searchTerm = e.target.value.trim();
            
            if (searchTerm == '') {
                return;
            }

            if (this.isBlockNumber(searchTerm)) {
                this.setState({redirectUrl:'/block/' + searchTerm});
            } else if (await this.isTransactionHash(searchTerm)) {
                this.setState({redirectUrl:'/transaction/' + searchTerm});
            } else if (await this.isAddress(searchTerm)) {
                this.setState({redirectUrl:'/address/' + searchTerm});
            }
            else {

                var blockNumber = await this.getBlockNumberOfBlockHash(searchTerm);
                if (blockNumber > 0) {
                    this.setState({redirectUrl:'/block/' + blockNumber});
                }
                else {
                    alert(searchTerm + ' is not a valid block number, block hash, transaction hash, or address.');
                }
            }
        }
    }

    isBlockNumber(searchTerm) {
        if (searchTerm.length > 16) {
            return false;
        }
        const blockNumber = parseInt(searchTerm);
        console.log('blockNumber', blockNumber);
        return blockNumber!==0 && blockNumber <= this.state.latestBlock.blockIndex;
    }

    async isAddress(searchTerm) {
        try {
            var response = await fetch(`/api/query/address/${searchTerm}`,{mode: 'cors'});
            var addressInfo = await response.json();

            if (addressInfo.totalReceived > 0 || addressInfo.totalSent > 0) {
                return true;
            }

            // at this point still not sure so do deeper check
            response = await fetch(`/api/query/transaction/${searchTerm}/transactions`,{mode: 'cors'});
            addressInfo = await response.json();

            return addressInfo.transactions.length > 0;
        } catch {
            return false;
        }
    }

    async isTransactionHash(searchTerm) {
        try {
            var response = await fetch(`/api/query/transaction/${searchTerm}`,{mode: 'cors'});
            var transaction = await response.json();
            return transaction.blockHash !== null;
        } catch {
            return false;
        }
    }

    async getBlockNumberOfBlockHash(searchTerm) {
        try {
            var response = await fetch(`/api/query/block/${searchTerm}`,{mode: 'cors'});
            var block = await response.json();
            return block.blockIndex;
        } catch {
            return 0;
        }
    }


    render() {
        if (this.state.redirectUrl) {
            return <Redirect to={this.state.redirectUrl}/>
        }
        
        return (
            <Grid>
                <div className="Home">
                    <div className="row">
                        <div class="col-md-1 logo"><img src='/nako_logo.png' width="60" /></div>
                        <div className="col-md-11"><input class="pull-right search form-control form-control-lg" onKeyDown={this.searchKeyPress} type="text" 
                            placeholder="Search for block number, block hash, transaction hash or address."></input></div>
                    </div>
                    <div className="well">
                        <h1>{this.state.latestBlock.coinTag} Block explorer</h1>
                    </div>
               
                    
                <div className="row">
                <div className="col-lg-3 col-md-6">
                    <div className="panel panel-primary">
                        <div className="panel-heading">
                            <div className="row">
                                <div className="col-xs-3">
                                    <i className="fa fa-comments fa-5x"></i>
                                </div>
                                <div className="col-xs-9 text-right">
                                    <div className="huge">{this.state.latestBlock.blockIndex}</div>
                                    <div>Block Height</div>
                                </div>
                            </div>
                        </div>
                       
                            <div className="panel-footer">
                                <span className="pull-left"><Link to={"/block/" +  this.state.latestBlock.blockIndex }> View latest </Link></span>
                                <span className="pull-right"><i className="fa fa-arrow-circle-right"></i></span>
                                <div className="clearfix"></div>
                            </div>
                       
                    </div>
                </div>
                {/* <div className="col-lg-3 col-md-6">
                    <div className="panel panel-green">
                        <div className="panel-heading">
                            <div className="row">
                                <div className="col-xs-3">
                                    <i className="fa fa-tasks fa-5x"></i>
                                </div>
                                <div className="col-xs-9 text-right">
                                    <div className="huge">$???.??m</div>
                                    <div>Market Cap</div>
                                </div>
                            </div>
                        </div>
                        <a href="#">
                            <div className="panel-footer">
                                <span className="pull-left">View Details</span>
                                <span className="pull-right"><i className="fa fa-arrow-circle-right"></i></span>
                                <div className="clearfix"></div>
                            </div>
                        </a>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="panel panel-yellow">
                        <div className="panel-heading">
                            <div className="row">
                                <div className="col-xs-3">
                                    <i className="fa fa-shopping-cart fa-5x"></i>
                                </div>
                                <div className="col-xs-9 text-right">
                                    <div className="huge">?</div>
                                    <div>Known Peers</div>
                                </div>
                            </div>
                        </div>
                        <a href="#">
                            <div className="panel-footer">
                                <span className="pull-left">View Details</span>
                                <span className="pull-right"><i className="fa fa-arrow-circle-right"></i></span>
                                <div className="clearfix"></div>
                            </div>
                        </a>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="panel panel-red">
                        <div className="panel-heading">
                            <div className="row">
                                <div className="col-xs-3">
                                    <i className="fa fa-support fa-5x"></i>
                                </div>
                                <div className="col-xs-9 text-right">
                                    <div className="huge"><span style={{fontSize:30 + 'px'}}>{parseInt(this.state.latestBlock.blockIndex) + 6000000000 }</span></div>
                                    <div>Total supply of {this.state.latestBlock.coinTag}</div>
                                </div>
                            </div>
                        </div>
                        <a href="#">
                            <div className="panel-footer">
                                <span className="pull-left">View Details</span>
                                <span className="pull-right"><i className="fa fa-arrow-circle-right"></i></span>
                                <div className="clearfix"></div>
                            </div>
                        </a>
                    </div>
                </div> */}
            </div>
                        <div>
                            Current height: <Link to={"/block/" +  this.state.latestBlock.blockIndex }> {this.state.latestBlock.blockIndex}</Link>
                            <Route path="/block/:blockIndex"  component={Block}/>

                            
                        </div>
                        <table className="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <td>Height</td>
                                <td>Age</td>
                                <td>Hash</td>
                                <td>Tx Count</td>
                                <td>Size</td>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.blocks
                            .map(function(object, i){
                                return <tr key={i}>
                                    <td><Link to={"/block/" +  object.blockIndex }> {object.blockIndex}</Link></td>
                                    <td><Moment fromNow ago unix>{object.blockTime}</Moment></td>
                                    <td>{object.blockHash}</td>
                                    <td>{object.transactionCount}</td>
                                    <td>{object.blockSize} bytes</td>
                                </tr>
                             } )}
                        </tbody>
                        </table>
                    
                
            
                </div>
            </Grid>
        );
    }
}

export default Home;
