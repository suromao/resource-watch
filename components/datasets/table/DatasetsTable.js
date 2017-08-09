import React from 'react';
import PropTypes from 'prop-types';
import { Autobind } from 'es-decorators';

// Redux
import { connect } from 'react-redux';
import { getDatasets, setFilters } from 'redactions/admin/datasets';

// Selectors
import getFilteredDatasets from 'selectors/admin/datasets';

// Components
import Spinner from 'components/ui/Spinner';
import CustomTable from 'components/ui/customtable/CustomTable';
import SearchInput from 'components/ui/SearchInput';

// Table components
import EditAction from './actions/EditAction';
import DeleteAction from './actions/DeleteAction';

// TDs
import NameTD from './td/NameTD';
import PublishedTD from './td/PublishedTD';
import StatusTD from './td/StatusTD';
import RelatedContentTD from './td/RelatedContentTD';
import UpdatedAtTD from './td/UpdatedAtTD';

class DatasetsTable extends React.Component {

  componentDidMount() {
    this.props.setFilters([]);
    this.props.getDatasets();
  }

  /**
   * Event handler executed when the user search for a dataset
   * @param {string} { value } Search keywords
   */
  @Autobind
  onSearch(value) {
    if (!value.length) {
      this.props.setFilters([]);
    } else {
      this.props.setFilters([{ key: 'name', value }]);
    }
  }

  getDatasets() {
    return this.props.datasets;
  }

  render() {
    const { routes } = this.props;

    return (
      <div className="c-dataset-table">
        <Spinner className="-light" isLoading={this.props.loading} />

        {this.props.error && (
          <p>Error: {this.props.error}</p>
        )}

        <SearchInput
          input={{
            placeholder: 'Search dataset'
          }}
          link={{
            label: 'New dataset',
            route: routes.detail,
            params: { tab: 'datasets', id: 'new' }
          }}
          onSearch={this.onSearch}
        />


        {!this.props.error && (
          <CustomTable
            columns={[
              { label: 'Name', value: 'name', td: NameTD, tdProps: { route: routes.detail } },
              { label: 'Status', value: 'status', td: StatusTD },
              { label: 'Published', value: 'published', td: PublishedTD },
              { label: 'Provider', value: 'provider' },
              { label: 'Updated at', value: 'updatedAt', td: UpdatedAtTD },
              { label: 'Related content', value: 'status', td: RelatedContentTD }
            ]}
            actions={{
              show: true,
              list: [
                { name: 'Edit', route: routes.detail, params: { tab: 'datasets', subtab: 'edit', id: '{{id}}' }, show: true, component: EditAction, componentProps: { route: routes.detail } },
                { name: 'Remove', route: routes.detail, params: { tab: 'datasets', subtab: 'remove', id: '{{id}}' }, component: DeleteAction, componentProps: { authorization: this.props.user.token } }
              ]
            }}
            sort={{
              field: 'name',
              value: 1
            }}
            filters={false}
            data={this.getDatasets()}
            pageSize={20}
            pagination={{
              enabled: true,
              pageSize: 20,
              page: 0
            }}
            onToggleSelectedRow={(ids) => { console.info(ids); }}
            onRowDelete={(id) => { console.info(id); }}
          />
        )}
      </div>
    );
  }
}

DatasetsTable.defaultProps = {
  routes: {
    index: '',
    detail: ''
  },
  columns: [],
  actions: {},
  // Store
  datasets: []
};

DatasetsTable.propTypes = {
  routes: PropTypes.object,

  // Store
  user: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  datasets: PropTypes.array.isRequired,
  error: PropTypes.string,

  // Actions
  getDatasets: PropTypes.func.isRequired,
  setFilters: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  user: state.user,
  loading: state.datasets.datasets.loading,
  datasets: getFilteredDatasets(state),
  error: state.datasets.datasets.error
});
const mapDispatchToProps = dispatch => ({
  getDatasets: () => dispatch(getDatasets()),
  setFilters: filters => dispatch(setFilters(filters))
});

export default connect(mapStateToProps, mapDispatchToProps)(DatasetsTable);
