import PropTypes from 'prop-types';
import React from 'react';
import AriaModal from 'react-aria-modal';
import {BrowserRouter as Router, Redirect, Route} from 'react-router-dom';
import WebMonitoringApi from '../services/web-monitoring-api';
import WebMonitoringDb from '../services/web-monitoring-db';
import Loading from './loading';
import LoginForm from './login-form';
import NavBar from './nav-bar';
import PageDetails from './page-details';
import PageList from './page-list';
import VersionRedirect from './version-redirect';

const configuration = window.webMonitoringConfig;

const api = new WebMonitoringDb({
  url: configuration.WEB_MONITORING_DB_URL
});

const localApi = new WebMonitoringApi(api);

/**
 * WebMonitoringUi represents the root container for the app. It also maintains
 * a top-level lsit of pages to share across the app. We do this here instead
 * of via caching in the web-monitoring-db API because we want any part of the
 * app that interates through pages to iterate through the same set of pages
 * with the same filters and conditions.
 *
 * @class WebMonitoringUi
 * @extends {React.Component}
 */
export default class WebMonitoringUi extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      assignedPages: null,
      isLoading: true,
      pageFilter: '', // keeps track of which set of pages we are looking at
      pages: null,
      showLogin: false,
      user: null,
    };
    this.showLogin = this.showLogin.bind(this);
    this.hideLogin = this.hideLogin.bind(this);
    this.afterLogin = this.afterLogin.bind(this);
    this.logOut = this.logOut.bind(this);
    this.loadPages = this.loadPages.bind(this);
    this.setPageFilter = this.setPageFilter.bind(this);
  }

  setPageFilter (filter) {
    this.setState({pageFilter: filter});
  }

  showLogin () {
    this.setState({showLogin: true});
  }

  hideLogin () {
    this.setState({showLogin: false, user: api.userData});
  }

  afterLogin (user) {
    this.hideLogin();
    this.loadPages(this.state.pageFilter);
  }

  logOut () {
    api.logOut();
    this.setState({user: api.userData});
    this.loadPages('pages');
  }

  /**
   * Load pages depending on whether we want all pages or assigned pages.
   * @private
   * @param {string} pageFilter Must be either 'assignedPages' or 'pages'
   *
   * Sends a requests out to either db-api or localApi for pages and sets
   * corresponding `assignedPages` or `pages` property of state and `pageFilter`.
   * These are passed as props to various child components.
   */
  loadPages (pageFilter) {
    api.isLoggedIn()
      .then(loggedIn => {
        if (!loggedIn) {
          return Promise.reject(new Error('You must be logged in to view pages'));
        }

        const query = {include_latest: true};
        if (pageFilter === 'assignedPages') {
          return localApi.getPagesForUser(api.userData.email, null, query);
        }
        else {
          return api.getPages(query);
        }
      })
      .then(pages => {
        this.setState({
          [pageFilter]: pages,
          pageFilter
        });
      });
  }

  loadUser () {
    api.isLoggedIn()
      .then(loggedIn => {
        this.setState({user: api.userData, isLoading: false});
      });
  }

  componentWillMount () {
    this.loadUser();
  }

  render () {
    if (this.state.isLoading) {
      return <Loading />;
    }

    if (!this.state.user) {
      return this.renderLoginDialog();
    }

    const withData = (ComponentType, pageType) => {
      return (routeProps) => {
        const pages = this.state[pageType];
        if (!pages) {
          this.loadPages(pageType);
        }
        return <ComponentType
          {...routeProps}
          pages={pages}
          user={this.state.user}
        />;
      };
    };
    const modal = this.state.showLogin ? this.renderLoginDialog() : null;

    return (
      <div>
        <Router>
          <div id="application">
            <NavBar
              title="EDGI"
              user={this.state.user}
              showLogin={this.showLogin}
              logOut={this.logOut}
              pageFilter={this.state.pageFilter}
              setPageFilter={this.setPageFilter}
            />
            <Route exact path="/" render={() => {
              if (this.state.user) {
                return <Redirect to="/assignedPages" />;
              } else {
                return <Redirect to="/pages" />;
              }
            }}/>
            <Route path="/pages" render={withData(PageList, 'pages')} />
            <Route path="/assignedPages" render={withData(PageList, 'assignedPages')} />
            <Route path="/page/:pageId/:change?" render={(routeProps) =>
              <PageDetails
                {...routeProps}
                user={this.state.user}
                pageFilter={this.state.pageFilter}
                pages={this.state[this.state.pageFilter]}
              />
            }/>
            <Route path="/version/:versionId" component={VersionRedirect} />
          </div>
        </Router>
        {modal}
      </div>
    );
  }

  renderLoginDialog () {
    return (
      <AriaModal
        titleText="Log in"
        onExit={this.hideLogin}
        applicationNode={document.getElementById('web-monitoring-ui-root')}
        dialogClass="dialog__body"
        underlayClass="dialog dialog__underlay"
        verticallyCenter={true}
      >
        <LoginForm cancelLogin={this.hideLogin} onLogin={this.afterLogin} />
      </AriaModal>
    );
  }
  // Context 1/2 - Context is information made available to any child element. The first part is
  //  defining a function that returns that information in an object. We're using object initializer
  //  syntax here. With context we can command all our minions with a single spell.
  getChildContext () {
    return {api, localApi};
  }
}

// Context 2/2 -define the types, shape and form our context
WebMonitoringUi.childContextTypes = {
  api: PropTypes.instanceOf(WebMonitoringDb),
  localApi: PropTypes.instanceOf(WebMonitoringApi)
};
