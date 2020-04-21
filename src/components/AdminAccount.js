import React, { Component } from 'react'
import {Container, Row, Col, Button, Form, ProgressBar, Image} from 'react-bootstrap'
import {withRouter} from 'react-router-dom'
import qs from 'qs'
import axios from 'axios'
import DataTable from './DataTable'
import verified from '../images/verified.png'

class AdminAccount extends Component
{
    constructor(props)
    {
        super(props)
        console.log(this.props)
        
        const query_params = qs.parse(this.props.location.search, { ignoreQueryPrefix: true })
        if("code" in query_params)
        {
            this.state = {
                auth_code: query_params["code"],
                google_sheets_link: "",
                totalInserts: 0,
                totalUpdates: 0,
                totalFailures: 0,
                recordsToSync: 0
            }
        }
        else
        {
            this.state = {
                google_sheets_link: "",
                totalInserts: 0,
                totalUpdates: 0,
                totalFailures: 0,
                recordsToSync: 0
            }
        }
    }

    componentDidMount()
    {
        this.getToken()
    }

    getToken = () =>
    {
        if("auth_code" in this.state)
        {
            axios.get(process.env.REACT_APP_API_ENDPOINT + "oauth_token", {params:{code: this.state.auth_code}}).then(
                response => {
                    this.setState({auth_tokens: response.data.tokens})
                    this.getUserInfo()
                }
            )
        }
    }

    getUserInfo = async () =>
    {
        axios.get(process.env.REACT_APP_API_ENDPOINT + "user_info", {params: {tokens: this.state.auth_tokens}}).then(async (response) =>
        {
            if(response.data && response.data.user)
            {
                this.setState({user_info: response.data.user.data})
                axios.get(process.env.REACT_APP_API_ENDPOINT + "admin", {params: {email: response.data.user.data.email}}).then(async (response) => {
                    this.setState({admin_info: response.data.admin})
                })
            }
        })    
    }

    getData = async () =>
    {
        //TODO: Extract Spreadsheet ID from Google Sheets Link
        const SPLIT_SPREADSHEET_LINK = this.state.google_sheets_link.split("/")
        console.log(SPLIT_SPREADSHEET_LINK.length)
        let SPREADSHEET_ID = undefined
        if(SPLIT_SPREADSHEET_LINK.length > 5)
        {
            SPREADSHEET_ID = SPLIT_SPREADSHEET_LINK[5]
            console.log(SPREADSHEET_ID)
        }
        console.log(SPLIT_SPREADSHEET_LINK)
        //TODO: Create Range const
        const RANGE = process.env.REACT_APP_GOOGLE_SHEETS_TEMPLATE_RANGE
        //TODO: Pass tokens and spreadsheet ID to get data
        let totalInsertedOrUpdated = 0
        console.log(process.env.REACT_APP_API_ENDPOINT + "data")
        console.log(this.state.auth_tokens)
        axios.get(process.env.REACT_APP_API_ENDPOINT + "data", {params: {tokens: this.state.auth_tokens, spreadsheet_id: SPREADSHEET_ID, spreadsheet_range: RANGE}}).then(async (response) =>
        {
            console.log(response)

            let records = response.data.data.values
            let column_names = records.shift()
            this.setState({recordsToSync: records.length, uploadingData: true})
            for(let i=0; i<records.length; i++)
            {
                let data = []
                let record = records[i]
                
                // console.log(this.state.admin_info)
                let payload = {"synced_by": this.state.admin_info._id}
                for(let j=0; j<column_names.length; j++)
                {
                    payload[column_names[j]] = record[j]
                }
                // console.log(payload["city"])
                // console.log(this.state.admin_info.cities)
                // console.log(this.state.admin_info.cities.includes(payload["city"]))
                if(this.state.admin_info.cities.includes(payload["city"]))
                {
                    data.push(payload)
                    let result = await axios.post(process.env.REACT_APP_SYNC_API_ENDPOINT, {"data": data})
                    totalInsertedOrUpdated += result.data.results
                    result = {totalInserts: this.state.totalInserts + result.data.inserts,
                    totalUpdates: this.state.totalUpdates + result.data.updates,
                    totalFailures: this.state.totalFailures + result.data.failures}
                    this.setState({...result})
                }
                else
                {
                    let result = {totalFailures: this.state.totalFailures + 1}
                    this.setState({...result})
                }
            }
            this.setState({recordsToSync: 0})

        })

        
    }

    onChange = (e) =>
    {
        this.setState({[e.target.name]: e.target.value})
    }

    beginGoogleOath = (e) =>
    {
        console.log(process.env.REACT_APP_API_ENDPOINT)
        axios.get(process.env.REACT_APP_API_ENDPOINT + "auth_url").then(response =>
            {
                if(response.status)
                {
                    window.location = response.data.url
                }
            })
        e.preventDefault()
    }

    render()
    {
        return (<div  className="center-screen">
            <Container>
                <Row>
                    <Col xs={12} lg={{span:6, offset:3}} className="central-wrapper">
                        <Col>
                            <h1>Welcome {this.state.admin_info && this.state.admin_info.name}{this.state.auth_tokens && <img src={verified} height={25}></img>}</h1>
                            {!this.state.auth_tokens && <p>If you are an admin, please login using your Google account to continue</p>}
                            {!this.state.auth_tokens && <p>If you are not an admin, please contact Jake or Vivek</p>}

                            {!this.state.auth_tokens && <Button variant="dark" onClick={this.beginGoogleOath}>Connect Google Account</Button>}
                            {this.state.user_info && 
                            <Col>
                                <Row>
                                    <Col xs={{span:6, offset:3}} lg={{span:4, offset: 4}} >
                                        <Image src={this.state.user_info.picture} fluid className="profile_pic"></Image>
                                    </Col>
                                    <Col xs={12} lg={12}>
                                        <h5>{this.state.user_info.email}</h5>
                                    </Col>
                                </Row>

                            </Col>}    
                        </Col>
                        {this.state.auth_tokens && this.state.recordsToSync == 0 && <Col>
                            <Form.Control type="text" name="google_sheets_link" value={this.state.google_sheets_link} placeholder="Paste Link to Google Sheets" onChange={this.onChange}></Form.Control>
                            <Button variant="dark" onClick={this.getData}>Sync my Data</Button>    
                            {/* <Button onClick={this.getUserInfo}>Get user info</Button>     */}

                        </Col>}
                        {this.state.data && <DataTable rows={this.state.data}></DataTable>}
                        {this.state.uploadingData && <Col className="status">
                            <Row>
                                <Col>
                                    <Row>
                                        <Col xs={1} className="green"></Col>
                                        <Col>Inserted: {this.state.totalInserts}</Col>
                                    </Row>
                                </Col>

                                <Col>
                                    <Row>
                                        <Col xs={1} className="yellow"></Col>
                                        <Col>Updated: {this.state.totalUpdates}</Col>
                                    </Row>
                                </Col>

                                <Col>
                                    <Row>
                                        <Col xs={1} className="red"></Col>
                                        <Col>Failed: {this.state.totalFailures}</Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>}
                        {/* {this.state.auth_tokens && <p style={{color: "green"}}>Total number of inserts: {this.state.totalInserts}</p>}
                        {this.state.auth_tokens && <p style={{color: "yellow"}}>Total number of updates: {this.state.totalUpdates}</p>}
                        {this.state.auth_tokens && <p style={{color: "red"}}>Total number of failures: {this.state.totalFailures}</p>} */}
                        <Col style={{"padding": "0px"}}>
                        {this.state.auth_tokens && this.state.uploadingData && <ProgressBar className="progressBar">
                            <ProgressBar striped variant="success" now={(100/this.state.recordsToSync)*this.state.totalInserts} key={1} />
                            <ProgressBar variant="warning" now={(100/this.state.recordsToSync)*this.state.totalUpdates} key={2} />
                            <ProgressBar striped variant="danger" now={(100/this.state.recordsToSync)*this.state.totalFailures} key={3} />
                        </ProgressBar>
                        }
                        </Col>
                        
                    </Col>

                </Row>
            </Container></div>
        )
    }
}


export default withRouter(AdminAccount)