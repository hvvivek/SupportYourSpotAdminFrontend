import React, { Component } from 'react'
import {Container, Row, Col, Button, Form} from 'react-bootstrap'
import {withRouter} from 'react-router-dom'
import qs from 'qs'
import axios from 'axios'
import { useTable } from 'react-table'


class DataRow{
    constructor(row)
    {
        this.col1 = row[0]
        this.col2 = row[1]
        this.col3 = row[2]
    }
}
class DataTable extends Component
{
    constructor(props)
    {
        super(props)
        // this.state = {data: this.reformatData(this.props.rows)}
    }

    // reformatData()
    // {
    //     let arrayData = this.props.rows
    //     this.setState({data: arrayData.map((row) => {if(row.length) {return DataRow(row)} else { return null}}))
    // }

    render()
    {
        return <p>{this.props.rows}</p>
    }
}

export default withRouter(DataTable)