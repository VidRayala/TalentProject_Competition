import React from 'react';
import ReactDOM from 'react-dom';
import Cookies from 'js-cookie';
import LoggedInBanner from '../../Layout/Banner/LoggedInBanner.jsx';
import { LoggedInNavigation } from '../../Layout/LoggedInNavigation.jsx';
import { JobSummaryCard } from './JobSummaryCard.jsx';
import { BodyWrapper, loaderData } from '../../Layout/BodyWrapper.jsx';
//import { Pagination, Icon, Dropdown, Checkbox, Accordion, Form, Segment } from 'semantic-ui-react';
import { Dropdown, Accordion, Icon, Form, Pagination } from 'semantic-ui-react';
//const style = {
//    color: "darkgrey"
//};

export default class ManageJob extends React.Component {
    constructor(props) {
        super(props);
        let loader = loaderData
        loader.allowedUsers.push("Employer");
        loader.allowedUsers.push("Recruiter");
        console.log(loader)
        this.state = {
            loadJobs: [],
            loaderData: loader,
            activePage: 1,
            sortBy: {
                date: "desc"
            },
            filter: {
                showActive: true,
                showClosed: false,
                showDraft: true,
                showExpired: true,
                showUnexpired: true
            },
            totalPages: 2,
            activeIndex: ""
        }
        this.loadData = this.loadData.bind(this);
        this.init = this.init.bind(this);
        this.loadNewData = this.loadNewData.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
        this.handlePaginationChange = this.handlePaginationChange.bind(this);
        this.handleSortChange = this.handleSortChange.bind(this);
        //your functions go here
    };

    init() {
        let loaderData = TalentUtil.deepCopy(this.state.loaderData)
        loaderData.isLoading = false;
        this.loadData(() =>
            this.setState({ loaderData })
        );
        console.log("aaa", this.state.loaderData);
    }

    componentDidMount() {
        this.init();
    };

    loadData(callback) {
        var link = 'http://localhost:51689/listing/listing/getSortedEmployerJobs';
        var cookies = Cookies.get('talentAuthToken');
        // your ajax call and other logic goes here
        $.ajax({
            url: link,
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "GET",
            data: {
                activePage: this.state.activePage,
                sortByDate: this.state.sortBy.date,
                showActive: this.state.filter.showActive,
                showClosed: this.state.filter.showClosed,
                showDraft: this.state.filter.showDraft,
                showExpired: this.state.filter.showExpired,
                showUnexpired: this.state.filter.showUnexpired
            },
            contentType: "application/json",
            dataType: "json",
            success: function (res) {
                this.setState({ loadJobs: res.myJobs, totalPages: Math.ceil(res.totalCount / 6) }, callback);                                    
            }.bind(this),
            error: function (res, a, b) {
                console.log(res)
                console.log(a)
                console.log(b)
            }.bind(this)           
     })       
        
    }  

    loadNewData(data) {
        var loader = this.state.loaderData;
        loader.isLoading = true;
        data[loaderData] = loader;
        this.setState(data, () => {
            console.log(data);
            this.loadData(() => {
                loader.isLoading = false;
                this.setState({
                    loadData: loader
                })
            })
        });
    }

    handlePaginationChange(e, { activePage }) {
        this.loadNewData({ activePage: activePage });
    }

    handleSortChange(e, { value, name }) {
        this.state.sortBy[name] = value;
        this.loadNewData({ sortBy: this.state.sortBy });
    }

    handleClick(e, titleProps) {
        const { index } = titleProps
        const { activeIndex } = this.state
        const newIndex = activeIndex === index ? -1 : index

        this.setState({ activeIndex: newIndex })
    }

    handleFilter(e, { checked, name }) {
        this.state.filter[name] = checked;
        this.setState({
            filter: this.state.filter
        })
    }

    render() {
        var res = undefined;
        if (this.state.loadJobs.length > 0) {

            res = this.state.loadJobs.map(x =>
                <JobSummaryCard
                    key={x.id}
                    data={x}
                    reloadData={this.loadData}
                />);
        }
        const options = [
            {
                key: 'desc',
                text: 'Newest first',
                value: 'desc',
                content: 'Newest first',
            },
            {
                key: 'asc',
                text: 'Oldest first',
                value: 'asc',
                content: 'Oldest first',
            }
        ];

        const { activeIndex } = this.state;

        return (
            <BodyWrapper reload={this.init} loaderData={this.state.loaderData}>
                <div className="ui container">
                    <div className="ui grid">
                        <div className="row">
                            <div className="sixteen wide column">
                                <h1>List of Jobs</h1>
                                <span>
                                    <i className="filter icon" /> {"Filter: "}
                                    <Dropdown inline simple text="Choose filter">
                                        <Dropdown.Menu>
                                            <Dropdown.Item key={"status"}>
                                                <Accordion>
                                                    <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleClick}>
                                                        <Icon name='dropdown' />
                                                        By Status
                                                    </Accordion.Title>
                                                    <Accordion.Content active={activeIndex === 1}>
                                                        <Form>
                                                            <Form.Group grouped>
                                                                <Form.Checkbox label='Active Jobs'
                                                                    name="showActive" onChange={this.handleFilter} checked={this.state.filter.showActive} />
                                                                <Form.Checkbox label='Closed Jobs'
                                                                    name="showClosed" onChange={this.handleFilter} checked={this.state.filter.showClosed} />
                                                                <Form.Checkbox label='Drafts'
                                                                    name="showDraft" onChange={this.handleFilter} checked={this.state.filter.showDraft} />
                                                            </Form.Group>
                                                        </Form>
                                                    </Accordion.Content>
                                                </Accordion>
                                            </Dropdown.Item>
                                            <Dropdown.Item key={"expiryDate"}>
                                                <Accordion>
                                                    <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                                                        <Icon name='dropdown' />
                                                        By Expiry Date
                                                    </Accordion.Title>
                                                    <Accordion.Content active={activeIndex === 0}>
                                                        <Form>
                                                            <Form.Group grouped>
                                                                <Form.Checkbox label='Expired Jobs'
                                                                    name="showExpired" onChange={this.handleFilter} checked={this.state.filter.showExpired} />
                                                                <Form.Checkbox label='Unexpired Jobs'
                                                                    name="showUnexpired" onChange={this.handleFilter} checked={this.state.filter.showUnexpired} />
                                                            </Form.Group>
                                                        </Form>
                                                    </Accordion.Content>
                                                </Accordion>
                                            </Dropdown.Item>
                                            <button className="ui teal small button"
                                                style={{ width: "100%", borderRadius: "0" }}
                                                onClick={() => this.loadNewData({ activePage: 1 })}
                                            >
                                                <i className="filter icon" />
                                                Filter
                                                </button>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </span>
                                <span>
                                    <i className="calendar icon" />
                                    {"Sort by date: "}
                                    <Dropdown inline simple options={options}
                                        name="date"
                                        onChange={this.handleSortChange}
                                        className="manage-jobs"
                                        value={this.state.sortBy.date}
                                    />
                                </span>
                                <div className="ui three cards">
                                    {
                                        res != undefined ?
                                            res
                                            : <React.Fragment>
                                                <p style={{
                                                    paddingTop: 20,
                                                    paddingBottom: 50,
                                                    marginLeft: 15
                                                }}>No Jobs Found</p>
                                            </React.Fragment>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="centered row">
                            <Pagination
                                ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                                firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                                lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                                prevItem={{ content: <Icon name='angle left' />, icon: true }}
                                nextItem={{ content: <Icon name='angle right' />, icon: true }}
                                totalPages={this.state.totalPages}
                                activePage={this.state.activePage}
                                onPageChange={this.handlePaginationChange}
                            />
                        </div>
                        <div className="row">
                        </div>
                    </div>
                </div>
            </BodyWrapper>
        )
    }
}


//<Segment.Group compact>
//    <Segment basic>
//        <Segment basic>
//            <h4>Test Analyst</h4>
//        </Segment>
//        <Label size="mini" as='a' color='black' ribbon='right'><Icon name='user' />0</Label>
//        <p><span style={style}>Melbourne, Australia</span><br></br>
//            We have A Position for a Test Analyst</p>

//    </Segment>
//    <Segment basic>
//    </Segment>
//    <Segment basic>
//    </Segment>
//    <Segment basic>
//    </Segment>
//    <Segment basic>
//    </Segment>
//    <Segment basic>
//    </Segment>
//    <Segment basic>
//    </Segment>
//    <Segment.Group horizontal>
//        <Segment>
//            <Button size="mini" negative>Expired</Button>
//            <Button.Group size="mini">
//                <Button size="mini" basic color='blue'><Icon name="ban"></Icon>Close</Button>
//                <Button size="mini" basic color='blue'><Icon name="edit outline"></Icon>Edit</Button>
//                <Button size="mini" basic color='blue'><Icon name="copy outline"></Icon>Copy</Button>
//            </Button.Group>
//        </Segment>
//    </Segment.Group>
//</Segment.Group>
//<BodyWrapper reload={this.loadData} loaderData={this.state.loaderData}>
//    <section className="page-body">
//        <div className="ui container">
//            <div className="ui grid">
//                <div className="row">
//                    <div className="twelve wide left aligned padded column">
//                        <h3>List Of Jobs</h3>
//                    </div>
//                </div>
//                <div className="row">
//                    <div className="ui equal width grid">
//                        <div className="eight wide column">
//                            <Segment.Group compact >
//                                <Segment basic>
//                                    <h4>Test Analyst</h4>
//                                    <Label size="mini" as='a' color='black' ribbon='right'><Icon name='user' />0</Label>
//                                    <p><span style={style}>Melbourne, Australia</span><br></br>
//                                        We have A Position for a Test Analyst</p>
//                                </Segment>
//                                <Segment basic>
//                                </Segment>
//                                <Segment basic>
//                                </Segment>
//                                <Segment basic>
//                                </Segment>
//                                <Segment basic>
//                                </Segment>
//                                <Segment.Group horizontal>
//                                    <Segment>
//                                        <Button size="mini" negative>Expired</Button>
//                                        <Button.Group size="mini">
//                                            <Button size="mini" basic color='blue'><Icon name="ban"></Icon>Close</Button>
//                                            <Button size="mini" basic color='blue'><Icon name="edit outline"></Icon>Edit</Button>
//                                            <Button size="mini" basic color='blue'><Icon name="copy outline"></Icon>Copy</Button>
//                                        </Button.Group>
//                                    </Segment>
//                                </Segment.Group>
//                            </Segment.Group>
//                        </div>
//                        <div className="eight wide column">
//                            <Segment.Group compact >
//                                <Segment basic>
//                                    <h4>Test Analyst</h4>
//                                    <Label size="mini" as='a' color='black' ribbon='right'><Icon name='user' />0</Label>
//                                    <p><span style={style}>Melbourne, Australia</span><br></br>
//                                        We have A Position for a Test Analyst</p>
//                                </Segment>
//                                <Segment basic>
//                                </Segment>
//                                <Segment basic>
//                                </Segment>
//                                <Segment basic>
//                                </Segment>
//                                <Segment basic>
//                                </Segment>
//                                <Segment.Group horizontal>
//                                    <Segment>
//                                        <Button size="mini" negative>Expired</Button>
//                                        <Button.Group size="mini">
//                                            <Button size="mini" basic color='blue'><Icon name="ban"></Icon>Close</Button>
//                                            <Button size="mini" basic color='blue'><Icon name="edit outline"></Icon>Edit</Button>
//                                            <Button size="mini" basic color='blue'><Icon name="copy outline"></Icon>Copy</Button>
//                                        </Button.Group>
//                                    </Segment>
//                                </Segment.Group>
//                            </Segment.Group>
//                        </div>
//                    </div>
//                </div>
//                <div className="sixteen wide center aligned padded column">
//                    <Segment basic>
//                        <Pagination defaultActivePage={1} totalPages={1} />
//                    </Segment>
//                </div>
//            </div>
//        </div>
//    </section >
//</BodyWrapper >
