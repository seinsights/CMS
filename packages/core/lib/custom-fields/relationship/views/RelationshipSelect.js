/** @jsxRuntime classic */

/** @jsx jsx */
import 'intersection-observer';
import { useEffect, useMemo, useState, createContext, useContext, useRef } from 'react';
import { jsx } from '@keystone-ui/core';
import { MultiSelect, Select, selectComponents } from '@keystone-ui/fields';
import { validate as validateUUID } from 'uuid';
import { ApolloClient, gql, InMemoryCache, useApolloClient, useQuery } from '@keystone-6/core/admin-ui/apollo';

function useIntersectionObserver(cb, ref) {
  const cbRef = useRef(cb);
  useEffect(() => {
    cbRef.current = cb;
  });
  useEffect(() => {
    let observer = new IntersectionObserver((...args) => cbRef.current(...args), {});
    let node = ref.current;

    if (node !== null) {
      observer.observe(node);
      return () => observer.unobserve(node);
    }
  }, [ref]);
}

const idValidators = {
  uuid: validateUUID,

  cuid(value) {
    return value.startsWith('c');
  },

  autoincrement(value) {
    return /^\d+$/.test(value);
  }

};

function useDebouncedValue(value, limitMs) {
  const [debouncedValue, setDebouncedValue] = useState(() => value);
  useEffect(() => {
    let id = setTimeout(() => {
      setDebouncedValue(() => value);
    }, limitMs);
    return () => {
      clearTimeout(id);
    };
  }, [value, limitMs]);
  return debouncedValue;
}

function useFilter(search, list) {
  return useMemo(() => {
    let conditions = [];

    if (search.length) {
      const idFieldKind = list.fields.id.controller.idFieldKind;
      const trimmedSearch = search.trim();
      const isValidId = idValidators[idFieldKind](trimmedSearch);

      if (isValidId) {
        conditions.push({
          id: {
            equals: trimmedSearch
          }
        });
      }

      for (const field of Object.values(list.fields)) {
        if (field.search !== null) {
          conditions.push({
            [field.path]: {
              contains: trimmedSearch,
              mode: field.search === 'insensitive' ? 'insensitive' : undefined
            }
          });
        }
      }
    }

    return {
      OR: conditions
    };
  }, [search, list]);
}

const initialItemsToLoad = 10;
const subsequentItemsToLoad = 50;
const idField = '____id____';
const labelField = '____label____';
const LoadingIndicatorContext = /*#__PURE__*/createContext({
  count: 0,
  ref: () => {}
});
export const RelationshipSelect = ({
  isImage,
  autoFocus,
  controlShouldRenderValue,
  isDisabled,
  isLoading,
  list,
  placeholder,
  portalMenu,
  state,
  extraSelection = ''
}) => {
  var _state$value, _data$items;

  let imagePreviewUrl = ''; // workaround: 沒時間抓bug，若是此處id是undefined（從有圖片換成沒圖片、從沒圖片換成有圖片）
  // 會造成整個keystone壞掉
  // 只好在這裡加一個絕對不會有的id：-1暫時解決問題

  const id = (state === null || state === void 0 ? void 0 : (_state$value = state.value) === null || _state$value === void 0 ? void 0 : _state$value.id) || -1;

  if (!!(isImage && id)) {
    var _response$image;

    const query = gql`
      query GET_IMAGE_PREVIEW_URL($id: ID) {
        image(where: { id: $id }) {
          id
          urlOriginal
        }
      }
    `;
    const {
      data: response
    } = useQuery(query, {
      variables: {
        id
      }
    });
    imagePreviewUrl = response === null || response === void 0 ? void 0 : (_response$image = response.image) === null || _response$image === void 0 ? void 0 : _response$image.urlOriginal;
  }

  const [search, setSearch] = useState(''); // note it's important that this is in state rather than a ref
  // because we want a re-render if the element changes
  // so that we can register the intersection observer
  // on the right element

  const [loadingIndicatorElement, setLoadingIndicatorElement] = useState(null);
  const QUERY = gql`
    query RelationshipSelect($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!) {
      items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip) {
        ${idField}: id
        ${labelField}: ${list.labelField}
        ${extraSelection}
       
      }
      count: ${list.gqlNames.listQueryCountName}(where: $where)
    }
  `;
  const debouncedSearch = useDebouncedValue(search, 200);
  const where = useFilter(debouncedSearch, list);
  const link = useApolloClient().link; // we're using a local apollo client here because writing a global implementation of the typePolicies
  // would require making assumptions about how pagination should work which won't always be right

  const apolloClient = useMemo(() => new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            [list.gqlNames.listQueryName]: {
              keyArgs: ['where'],
              merge: (existing, incoming, {
                args
              }) => {
                const merged = existing ? existing.slice() : [];
                const {
                  skip
                } = args;

                for (let i = 0; i < incoming.length; ++i) {
                  merged[skip + i] = incoming[i];
                }

                return merged;
              }
            }
          }
        }
      }
    })
  }), [link, list.gqlNames.listQueryName]);
  const {
    data,
    error,
    loading,
    fetchMore
  } = useQuery(QUERY, {
    fetchPolicy: 'network-only',
    variables: {
      where,
      take: initialItemsToLoad,
      skip: 0
    },
    client: apolloClient
  });
  const count = (data === null || data === void 0 ? void 0 : data.count) || 0;
  const options = (data === null || data === void 0 ? void 0 : (_data$items = data.items) === null || _data$items === void 0 ? void 0 : _data$items.map(({
    [idField]: value,
    [labelField]: label,
    ...data
  }) => {
    if (isImage) {
      return {
        value,
        label: label || value,
        data
      };
    } else {
      return {
        value,
        label: label || value,
        data
      };
    }
  })) || [];
  const loadingIndicatorContextVal = useMemo(() => ({
    count,
    ref: setLoadingIndicatorElement
  }), [count]); // we want to avoid fetching more again and `loading` from Apollo
  // doesn't seem to become true when fetching more

  const [lastFetchMore, setLastFetchMore] = useState(null);
  useIntersectionObserver(([{
    isIntersecting
  }]) => {
    const skip = data === null || data === void 0 ? void 0 : data.items.length;

    if (!loading && skip && isIntersecting && options.length < count && ((lastFetchMore === null || lastFetchMore === void 0 ? void 0 : lastFetchMore.extraSelection) !== extraSelection || (lastFetchMore === null || lastFetchMore === void 0 ? void 0 : lastFetchMore.where) !== where || (lastFetchMore === null || lastFetchMore === void 0 ? void 0 : lastFetchMore.list) !== list || (lastFetchMore === null || lastFetchMore === void 0 ? void 0 : lastFetchMore.skip) !== skip)) {
      const QUERY = gql`
              query RelationshipSelectMore($where: ${list.gqlNames.whereInputName}!, $take: Int!, $skip: Int!) {
                items: ${list.gqlNames.listQueryName}(where: $where, take: $take, skip: $skip) {
                  ${labelField}: ${list.labelField}
                  ${idField}: id
                  ${extraSelection}
                 
                }
              }
            `;
      setLastFetchMore({
        extraSelection,
        list,
        skip,
        where
      });
      fetchMore({
        query: QUERY,
        variables: {
          where,
          take: subsequentItemsToLoad,
          skip
        }
      }).then(() => {
        setLastFetchMore(null);
      }).catch(() => {
        setLastFetchMore(null);
      });
    }
  }, {
    current: loadingIndicatorElement
  }); // TODO: better error UI
  // TODO: Handle permission errors
  // (ie; user has permission to read this relationship field, but
  // not the related list, or some items on the list)

  if (error) {
    return jsx("span", null, "Error");
  }

  if (state.kind === 'one') {
    return jsx(LoadingIndicatorContext.Provider, {
      value: loadingIndicatorContextVal
    }, jsx(Select // this is necessary because react-select passes a second argument to onInputChange
    // and useState setters log a warning if a second argument is passed
    , {
      onInputChange: val => setSearch(val),
      isLoading: loading || isLoading,
      autoFocus: autoFocus,
      components: relationshipSelectComponents,
      portalMenu: portalMenu,
      value: state.value ? {
        value: state.value.id,
        label: state.value.label,
        // @ts-ignore
        data: state.value.data
      } : null,
      options: options,
      onChange: value => {
        state.onChange(value ? {
          id: value.value,
          label: value.label,
          data: value.data
        } : null);
      },
      placeholder: placeholder,
      controlShouldRenderValue: controlShouldRenderValue,
      isClearable: controlShouldRenderValue,
      isDisabled: isDisabled
    }), isImage ? jsx(ImagePreview, {
      previewUrl: imagePreviewUrl
    }) : null);
  }

  return jsx(LoadingIndicatorContext.Provider, {
    value: loadingIndicatorContextVal
  }, jsx(MultiSelect // this is necessary because react-select passes a second argument to onInputChange
  // and useState setters log a warning if a second argument is passed
  , {
    onInputChange: val => setSearch(val),
    isLoading: loading || isLoading,
    autoFocus: autoFocus,
    components: relationshipSelectComponents,
    portalMenu: portalMenu,
    value: state.value.map(value => ({
      value: value.id,
      label: value.label,
      data: value.data
    })),
    options: options,
    onChange: value => {
      state.onChange(value.map(x => ({
        id: x.value,
        label: x.label,
        data: x.data
      })));
    },
    placeholder: placeholder,
    controlShouldRenderValue: controlShouldRenderValue,
    isClearable: controlShouldRenderValue,
    isDisabled: isDisabled
  }), isImage ? jsx(ImagePreview, {
    previewUrl: imagePreviewUrl
  }) : null);
};
const relationshipSelectComponents = {
  MenuList: ({
    children,
    ...props
  }) => {
    const {
      count,
      ref
    } = useContext(LoadingIndicatorContext);
    return jsx(selectComponents.MenuList, props, children, jsx("div", {
      css: {
        textAlign: 'center'
      },
      ref: ref
    }, props.options.length < count && jsx("span", {
      css: {
        padding: 8
      }
    }, "Loading...")));
  }
};
export const ImagePreview = ({
  previewUrl
}) => {
  return previewUrl ? jsx("div", null, jsx("img", {
    src: previewUrl,
    style: {
      width: '100%',
      height: '100%'
    }
  })) : null;
};