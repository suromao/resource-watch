import { createAction, createThunkAction } from 'redux-tools';
import { toastr } from 'react-redux-toastr';
import { replace } from 'layer-manager';
import axios from 'axios';
import moment from 'moment';
import WRISerializer from 'wri-json-api-serializer';

// services
import { fetchCountries } from 'services/geostore';
import { fetchUserAreas, createArea } from 'services/areas';
import {
  fetchSubscriptions,
  createSubscriptionToArea as createSubscriptionToAreaService,
  updateSubscriptionToArea,
  deleteSubscription
} from 'services/subscriptions';

import DatasetService from 'services/DatasetService';
import { fetchQuery } from 'services/query';

// actions – user subscriptions
export const setSubscriptions = createAction('SUBSCRIPTIONS__SET-SUBSCRIPTIONS');
export const setSubscriptionsLoading = createAction('SUBSCRIPTIONS__SET-SUBSCRIPTIONS-LOADING');
export const setSubscriptionsError = createAction('SUBSCRIPTIONS__SET-SUBSCRIPTIONS-ERROR');
export const clearSubscriptions = createAction('SUBSCRIPTIONS__CLEAR-SUBSCRIPTIONS');
export const setAlertsPreview = createAction('ALERTS__SET-ALERTS-PREVIEW');
export const setSubscriptionsLoadingPreview = createAction('ALERTS__SET-ALERTS-LOADING');
export const setSubscriptionsErrorPreview = createAction('ALERTS__SET-ALERTS-ERROR');
export const clearSubscriptionsPreview = createAction('ALERTS__CLEAR-ALERTS');

export const getUserSubscriptions = createThunkAction(
  'SUBSCRIPTIONS__GET-USER-SUBSCRIPTIONS',
  () => (dispatch, getState) => {
    const { user } = getState();
    const { token } = user;

    dispatch(setSubscriptionsLoading(true));

    fetchSubscriptions(token)
      .then((subscriptions = []) => {
        dispatch(setSubscriptions(subscriptions));
        dispatch(setSubscriptionsLoading(false));
      })
      .catch((err) => {
        dispatch(setSubscriptionsError(err));
        toastr.error('Error loading user subscriptions', err);
      });
  }
);

// actions - user subscriptions preview
export const getUserSubscriptionsPreview = createThunkAction(
  'SUBSCRIPTIONS__GET-USER-SUBSCRIPTIONS-PREVIEW',
  () => (dispatch, getState) => {
    const { user, subscriptions } = getState();
    const { token } = user;
    const { userSelection } = subscriptions;
    const { datasets } = userSelection;
    const yesterday = moment().subtract(1, 'day');
    // provisionally, sets date range from yesterday to a week ago
    const params = {
      begin: yesterday.subtract(1, 'week').format('MM-DD-YYYY'),
      end: yesterday.format('MM-DD-YYYY')
    };
    const fetchs = datasets
      .map((dataset) => {
        const selectedSubscription = dataset.subscriptions.find(
          _subscription => _subscription.selected
        );

        if (selectedSubscription) {
          const { query } = selectedSubscription;
          return fetchQuery(token, replace(query, params));
        }

        return null;
      })
      .filter(e => e !== null);

    dispatch(setSubscriptionsLoadingPreview(true));

    axios
      .all(fetchs)
      .then(
        axios.spread((...responses) => {
          dispatch(setAlertsPreview(responses.map(response => response.data.data)));
        })
      )
      .catch((err) => {
        dispatch(setSubscriptionsError(err));
        toastr.error('Error loading preview', err);
      })
      .then(() => {
        dispatch(setSubscriptionsLoadingPreview(false));
      });
  }
);

// actions – areas
export const setAreas = createAction('SUBSCRIPTIONS__SET-AREAS');
export const setAreasLoading = createAction('SUBSCRIPTIONS__SET-AREAS-LOADING');
export const setAreasError = createAction('SUBSCRIPTIONS__SET-AREAS-ERROR');

export const getAreas = createThunkAction('SUBSCRIPTIONS__GET-AREAS', () => (dispatch) => {
  dispatch(setAreasLoading(true));

  fetchCountries()
    .then((areas = []) => {
      dispatch(setAreas(areas));
      dispatch(setAreasLoading(false));
    })
    .catch((err) => {
      dispatch(setAreasError(err));
      toastr.error('Error loading areas', err);
    });
});

// actions – user areas
export const setUserAreas = createAction('SUBSCRIPTIONS__SET-USER-AREAS');
export const setUserAreasLoading = createAction('SUBSCRIPTIONS__SET-USER-AREAS-LOADING');
export const setUserAreasError = createAction('SUBSCRIPTIONS__SET-USER-AREAS-ERROR');

export const getUserAreas = createThunkAction(
  'SUBSCRIPTIONS__GET-USER-AREAS',
  () => (dispatch, getState) => {
    const { user } = getState();
    const { token } = user;

    dispatch(setUserAreasLoading(true));

    fetchUserAreas(token)
      .then((userAreas = []) => {
        dispatch(setUserAreas(userAreas));
        dispatch(setUserAreasLoading(false));
      })
      .catch((err) => {
        dispatch(setUserAreasError(err));
        toastr.error('Error loading user areas', err);
      });
  }
);

// actions – datasets
export const setDatasets = createAction('SUBSCRIPTIONS__SET-DATASETS');
export const setDatasetsLoading = createAction('SUBSCRIPTIONS__SET-DATASETS-LOADING');
export const setDatasetsError = createAction('SUBSCRIPTIONS__SET-DATASETS-ERROR');

export const getDatasets = createThunkAction(
  'SUBSCRIPTIONS__GET-DATASETS',
  () => (dispatch, getState) => {
    const { common } = getState();
    const { locale } = common;
    const datasetService = new DatasetService(null, {
      apiURL: process.env.WRI_API_URL,
      language: locale
    });

    dispatch(setDatasetsLoading(true));

    datasetService
      .getSubscribableDatasets('metadata')
      .then((datasets = []) => {
        const parsedDatasets = WRISerializer({ data: datasets });
        dispatch(setDatasets(parsedDatasets));
        dispatch(setDatasetsLoading(false));
      })
      .catch((err) => {
        dispatch(setDatasetsError(err));
        toastr.error('Error loading suscribable datasets', err);
      });
  }
);

// actions – user selection
export const setUserSelection = createAction('SUBSCRIPTIONS__SET-USER-SELECTION');
export const clearUserSelection = createAction('SUBSCRIPTIONS__CLEAR-USER-SELECTION');

// actions – reset
export const resetModal = createAction('SUBSCRIPTIONS__RESET-MODAL');

// actions – subscription creation
export const setSubscriptionSuccess = createAction('SUBSCRIPTIONS__SET_SUBSCRIPTION_SUCCESS');
export const setSubscriptionLoading = createAction('SUBSCRIPTIONS__SET_SUBSCRIPTION_LOADING');
export const setSubscriptionError = createAction('SUBSCRIPTIONS__SET_SUBSCRIPTION_ERROR');
export const clearLocalSubscriptions = createAction('SUBSCRIPTIONS__CLEAR_LOCA_SUBSCRIPTIONS');

export const createSubscriptionToArea = createThunkAction(
  'SUBSCRIPTIONS__CREATE-SUBSCRIPTION-ON-AREA',
  () => (dispatch, getState) => {
    const { subscriptions, user, common } = getState();
    const { userSelection } = subscriptions;
    const { area, datasets } = userSelection;
    const { locale } = common;
    const areaId = area.id;

    dispatch(setSubscriptionSuccess(false));
    dispatch(setSubscriptionLoading(true));

    axios.all(
      datasets
        .map((_dataset) => {
          const datasetId = _dataset.id;
          const datasetQuery = {
            d: _dataset.id,
            type: (_dataset.subscriptions.find(_subscription => _subscription.selected) || {})
              .value,
            threshold: _dataset.threshold
          };

          return createSubscriptionToAreaService({
            areaId,
            datasets: datasetId,
            datasetsQuery: datasetQuery,
            user,
            language: locale
          })
            .then(() => {
              dispatch(setSubscriptionSuccess(true));
              dispatch(setSubscriptionLoading(false));
            })
            .catch((err) => {
              dispatch(setSubscriptionError(err));
              dispatch(setSubscriptionLoading(false));

              toastr.error('Error: unable to create the subscription', err);
            });
        })
    );
  }
);

export const createSubscriptionOnNewArea = createThunkAction(
  'SUBSCRIPTIONS__CREATE-SUBSCRIPTION-NEW-AREA',
  () => (dispatch, getState) => {
    const { subscriptions, user, common } = getState();
    const { userSelection } = subscriptions;
    const { area, datasets } = userSelection;
    const { label, isGeostore } = area;
    const { token } = user;
    const { locale } = common;

    dispatch(setSubscriptionSuccess(false));
    dispatch(setSubscriptionLoading(true));

    return createArea(label, isGeostore, token)
      .then((data) => {
        const areaId = data.id;

        axios.all(
          datasets
            .map((_dataset) => {
              const datasetId = _dataset.id;
              const datasetQuery = {
                d: _dataset.id,
                type: (_dataset.subscriptions.find(_subscription => _subscription.selected) || {})
                  .value,
                threshold: _dataset.threshold
              };

              return createSubscriptionToAreaService({
                areaId,
                datasets: datasetId,
                datasetsQuery: datasetQuery,
                user,
                language: locale
              })
                .then(() => {
                  dispatch(setSubscriptionSuccess(true));
                  dispatch(setSubscriptionLoading(false));
                })
                .catch((err) => {
                  dispatch(setSubscriptionError(err));
                  dispatch(setSubscriptionLoading(false));

                  toastr.error('Error: unable to create the subscription', err);
                });
            })
        );
      })
      .catch((err) => {
        dispatch(setSubscriptionError(err));
        dispatch(setSubscriptionLoading(false));
        toastr.error('Error: unable to create area', err);
      });
  }
);

export const updateSubscription = createThunkAction(
  'SUBSCRIPTIONS__UPDATE-SUBSCRIPTION',
  () => (dispatch, getState) => {
    const { subscriptions, user, common } = getState();
    const { userSelection } = subscriptions;
    const {
      datasets,
      area: {
        id: areaId,
        subscription: { id: subscriptionId, datasets: oldDatasets }
      }
    } = userSelection;
    const { locale } = common;
    console.log('userSelection', userSelection);

    const newDatasets = datasets.map(d => d.id);
    // const newDatastesQuery = datasets.map(d => {
    //   d: _dataset.id,
    //   type: (_dataset.subscriptions.find(_subscription => _subscription.selected) || {}).value,
    //   threshold: _dataset.threshold
    // });

    // updateSubscriptionToArea(
    //   subscriptionId,
    //   datasetId,
    //   datasetQuery,
    //   user,
    //   locale,
    //   areaId
    // ).then(() => {
    //   dispatch(setSubscriptionSuccess(true));
    //   dispatch(setSubscriptionLoading(false));
    //   toastr.success('Subscriptions updated successfully');
    // }).catch((err) => {
    //   dispatch(setSubscriptionError(err));
    //   dispatch(setSubscriptionLoading(false));
    //   toastr.error('Error: unable to update the subscription', err);
    // });
    const oldDatasetsIds = oldDatasets.map(d => d.id);
    const newDatasetsIds = datasets.map(d => d.id);

    const removedDatasetsIds = oldDatasetsIds.filter(dId => !newDatasetsIds.find(e => e === dId));
    const removedDatasets = datasets.filter(d => !!removedDatasetsIds.find(e => d.id === e));
    console.log('removedDatasets', removedDatasets);
    const addedDatasetsIds = newDatasetsIds.filter(dId => !oldDatasetsIds.find(e => e === dId));
    const addedDatasets = datasets.filter(d => !!addedDatasetsIds.find(e => d.id === e));
    console.log('addedDatasets', addedDatasets);
    const datasetsKeptIds = oldDatasetsIds.filter(dId => newDatasetsIds.find(e => e === dId));
    const datasetsKept = datasets.filter(d => datasetsKeptIds.find(e => d.id === e));
    console.log('datasetsKept', datasetsKept);

    dispatch(setSubscriptionSuccess(false));
    dispatch(setSubscriptionLoading(true));

    // --- DATASETS KEPT IN THE SUBSCRIPTION UPDATE -----
    datasetsKept.forEach((_dataset) => {
      const datasetId = _dataset.id;
      const datasetQuery = {
        d: _dataset.id,
        type: (_dataset.subscriptions.find(_subscription => _subscription.selected) || {}).value,
        threshold: _dataset.threshold
      };

      const promise = updateSubscriptionToArea(
        subscriptionId,
        datasetId,
        datasetQuery,
        user,
        locale,
        areaId
      )
        .then(() => {
          dispatch(setSubscriptionSuccess(true));
          dispatch(setSubscriptionLoading(false));
          toastr.success('Subscriptions updated successfully');
        })
        .catch((err) => {
          dispatch(setSubscriptionError(err));
          dispatch(setSubscriptionLoading(false));
          toastr.error('Error: unable to update the subscription', err);
        });

      promises.push(promise);
    });

    // --- DATASETS REMOVED FROM THE SUBSCRIPTION UPDATE -----
    removedDatasets.forEach((_dataset) => {
      const datasetId = _dataset.id;
      console.log('dataset', _dataset);

      const promise = deleteSubscription(subscriptionId, user.token)
        .then(() => {
          dispatch(setSubscriptionSuccess(true));
          dispatch(setSubscriptionLoading(false));
        })
        .catch((err) => {
          dispatch(setSubscriptionError(err));
          dispatch(setSubscriptionLoading(false));
          toastr.error('Error: unable to delete one of the subscriptions', err);
        });

      promises.push(promise);
    });

    // Promise.all(promises)
    //   .then(() => {
    //     dispatch(setSubscriptionSuccess(false));
    //     dispatch(setSubscriptionLoading(true));
    //   })
    //   .catch((err) => {
    //     dispatch(setSubscriptionError(err));
    //     dispatch(setSubscriptionLoading(false));
    //     toastr.error('unable to update the subscription', err);
    //   });
  }
);

export default {
  setAreas,
  setAreasLoading,
  setAreasError,
  getAreas,

  setSubscriptions,
  setSubscriptionsLoading,
  setSubscriptionsError,
  getUserSubscriptions,
  getUserSubscriptionsPreview,

  setUserAreas,
  setUserAreasLoading,
  setUserAreasError,
  getUserAreas,

  setDatasets,
  setDatasetsLoading,
  setDatasetsError,
  getDatasets,

  setUserSelection,
  clearUserSelection,

  resetModal,

  setSubscriptionSuccess,
  setSubscriptionLoading,
  setSubscriptionError,
  clearLocalSubscriptions,

  createSubscriptionToArea,
  createSubscriptionOnNewArea,
  updateSubscription
};
