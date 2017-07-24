import React from 'react';
import PropTypes from 'prop-types';
import { Autobind } from 'es-decorators';

// Redux
import withRedux from 'next-redux-wrapper';
import { initStore } from 'store';

// Services
import UserService from 'services/UserService';
import WidgetService from 'services/WidgetService';

// Components
import Spinner from 'components/ui/Spinner';
import WidgetList from 'components/widgets/WidgetList';

class MyRWWidgetsStarred extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      user: null,
      starredWidgets: false,
      starredWidgetsLoaded: null
    };

    // User service
    this.userService = new UserService({ apiURL: process.env.CONTROL_TOWER_URL });
    this.widgetService = new WidgetService(null, { apiURL: process.env.CONTROL_TOWER_URL });
  }

  componentDidMount() {
    if (!this.props.user.id) {
      this.waitForUserToBeLoaded();
    } else {
      this.loadWidgets();
    }
  }

  waitForUserToBeLoaded() {
    setTimeout(() => {
      if (this.props.user.id) {
        this.loadWidgets();
      } else {
        this.waitForUserToBeLoaded();
      }
    }, 1000);
  }

  loadWidgets() {
    this.setState({
      starredWidgets: false
    });
    this.userService.getFavouriteWidgets(this.props.user.token)
    .then((response) => {
      this.setState({
        starredWidgets: response.map((elem) => {
          const favouriteId = elem.id;
          return Object.assign({}, elem.attributes.resource, { favouriteId });
        }),
        starredWidgetsLoaded: true
      });
    }).catch(err => console.log(err)); // eslint-disable-line no-console
  }

  @Autobind
  handleWidgetRemoved() {
    this.loadWidgets(this.props);
  }

  render() {
    const { starredWidgets, starredWidgetsLoaded } = this.state;
    return (
      <div className="c-myrw-widgets-starred">
        <div className="row">
          <div className="column small-12">
            <Spinner
              isLoading={!starredWidgetsLoaded}
              className="-relative -light"
            />
            {starredWidgets &&
            <WidgetList
              widgets={starredWidgets}
              mode="grid"
              showRemove={false}
              showEmbed={false}
            />
            }
            {starredWidgets && starredWidgets.length === 0 &&
            <div className="no-widgets-div">
              You currently have no widgets
            </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

MyRWWidgetsStarred.propTypes = {
  // Store
  user: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  user: state.user
});

export default withRedux(initStore, mapStateToProps, null)(MyRWWidgetsStarred);
