import WRISerializer from 'wri-json-api-serializer';

// utils
import { WRIAPI } from 'utils/axios';
import { logger } from 'utils/logs';

/**
 * Get all tags
 */
export const fetchAllTags = (params = {
  env: process.env.API_ENV,
  application: process.application.APPLICATIONS
}) => {
  logger.info('Fetch all tags');
  return WRIAPI.get('graph/query/list-concepts',
    {
      headers: { 'Upgrade-Insecure-Requests': 1 },
      params
    }
  )
  .then(response => WRISerializer(response.data))
  .catch((response) => {
    const { status, statusText } = response;
    logger.error(`Error fetching all tags: ${status}: ${statusText}`);
    throw new Error(`Error fetching all tags: ${status}: ${statusText}`);
  });
};

/**
 * Get inferred tags
 */
export const fetchInferredTags = (tags) => {
  logger.info('Fetch inferred tags');
  return WRIAPI.get('graph/query/concepts-inferred?concepts=${tags}',
    {
      headers: { 'Upgrade-Insecure-Requests': 1 },
      params
    }
  )
  .then(response => WRISerializer(response.data))
  .catch((response) => {
    const { status, statusText } = response;
    logger.error(`Error fetching inferred tags: ${tags} ${status}: ${statusText}`);
    throw new Error(`Error inferred tags: ${tags} ${status}: ${statusText}`);
  });
};

/**
* Get dataset tags
*/
export const fetchDatasetTags = (datasetId, params = {
  env: process.env.API_ENV,
  application: process.application.APPLICATIONS
}) => {
  logger.info(`Fetch dataset tags: ${datasetId}`);
  return WRIAPI.get('dataset/${datasetId}/vocabulary',
    {
      headers: { 'Upgrade-Insecure-Requests': 1 },
      params
    }
  )
  .then(response => WRISerializer(response.data))
  .catch((response) => {
    const { status, statusText } = response;
    logger.error(`Error fetching dataset tags ${datasetId}: ${status}: ${statusText}`);
    throw new Error(`Error fetching dataset tags ${datasetId}: ${status}: ${statusText}`);
  });
};

/**
* Update dataset tags
*/
export const updateDatasetTags = (datasetId, tags, token, usePatch = false) => {
  let bodyObj = {
    knowledge_graph: {
      tags,
      application: process.env.APPLICATIONS,
      env: process.env.API_ENV
    }
  };
  let method = tags.length > 0 ? 'PUT' : 'DELETE';
  let url = `${process.env.WRI_API_URL}/dataset/${datasetId}/vocabulary`;

  if (usePatch) {
    method = 'PATCH';
    bodyObj = { tags, application: process.env.APPLICATIONS };
    url = `${url}/knowledge_graph`;
  }

  if (method === 'DELETE') {
    url = `${url}/knowledge_graph?application=${process.env.APPLICATIONS}`;
    bodyObj = {};
  }

  return fetch(url, {
    method,
    body: JSON.stringify(bodyObj),
    headers: {
      Authorization: token
    }
  })
    .then(response => response.json())
    .then(jsonData => jsonData.data);
};

/**
 * Send a request to count a view to the dataset
 * @param {string} datasetId Dataset ID
 * @param {string} [token] User token
 * @returns {Promise<void>}
 */
export const countDatasetView = (datasetId, token, params = {
  env: process.env.API_ENV,
  application: process.env.APPLICATIONS
}) => {
  logger.info('Count dataset view');
  return WRIAPI.post(`graph/dataset/${datasetId}/visited`,
    {},
    {
      headers: {
        Authorization: token
      },
      params
    }
  );
};

/**
 * Get the list of most viewed datasets
 * @returns {Promise<string[]>} List of sorted ids
 */
getMostViewedDatasets() {
  return fetch(
    `${process.env.WRI_API_URL}/graph/query/most-viewed?application=${process.env.APPLICATIONS}&env=${process.env.API_ENV}`,
    { headers: { 'Upgrade-Insecure-Requests': 1 } }

  )
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error('Unable to fetch the most viewed datasets');
    })
    .then(res => res.data.map(d => d.dataset));
}

/**
 * Get the list of most favourited datasets
 * @returns {Promise<string[]>} List of sorted ids
 */
getMostFavoritedDatasets() {
  return fetch(
    `${process.env.WRI_API_URL}/graph/query/most-liked-datasets?application=${process.env.APPLICATIONS}&env=${process.env.API_ENV}`,
    { headers: { 'Upgrade-Insecure-Requests': 1 } }

  )
    .then((res) => {
      if (res.ok) return res.json();
      throw new Error('Unable to fetch the most favourited datasets');
    })
    .then(res => res.data.map(d => d.id));
}


export default {
  fetchMostViewedDatasets,
  fetchMostFavoritedDatasets,
  countDatasetView,
  updateDatasetTags,
  fetchDatasetTags,
  fetchInferredTags,
  fetchAllTags
};
