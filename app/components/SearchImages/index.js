import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { get } from 'lodash';
import { withRouter } from 'react-router';

import Loading from '../Loading';
import styles from './styles.scss';

const BASE_URL = 'https://images-api.nasa.gov';

export default withRouter(props => {
  const queryTerm = props.match.params.query;

  const [state, setState] = useState({
    searchTerm: queryTerm || '',
    loading: false,
    images: [],
    noResults: false,
  });

  useEffect(() => {
    if (state.searchTerm) {
      handleSearch();
    }
  }, []);

  const fetchImages = useCallback(async () => {
    const resp = await axios.get(`${BASE_URL}/search?q=${state.searchTerm}`);
    const images = get(resp, ['data', 'collection', 'items']);

    if (!images || !images.length) {
      setState({ ...state, images: [], loading: false, noResults: true });
    } else {
      setState({ ...state, images, loading: false, noResults: false });
    }
  }, [state.searchTerm]);

  const handleSearch = useCallback(() => {
    if (!state.searchTerm) {
      props.history.push(`/`);
      setState({ ...state, images: [], noResults: false });
    } else {
      setState({ ...state, images: [], loading: true, noResults: false });
      props.history.push(`/q/${state.searchTerm}`);
      fetchImages();
    }
  }, [state.searchTerm]);

  const handleInputKeyDown = e => {
    if (e.keyCode === 13) {
      handleSearch();
    }
  };

  const handleInputChange = e => {
    setState({ ...state, searchTerm: e.target.value });
  };

  const renderImages = () => (
    <>
      <div className="SearchImages__results">Results:</div>
      <div className="SearchImages__images-container">
        {state.images.map(image => (
          <img
            alt={`${state.searchTerm}`}
            key={get(image, ['data', 0, 'nasa_id'])}
            src={get(image, ['links', 0, 'href'])}
          />
        ))}
      </div>
    </>
  );

  return (
    <div className="SearchImages">
      <div className="SearchImages__search-container">
        <input
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          value={state.searchTerm}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {state.loading && <Loading />}
      {state.noResults && 'No results found'}
      {state.images && state.images.length > 0 && renderImages()}
    </div>
  );
});
