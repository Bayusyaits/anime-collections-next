import React from "react";
import { useMutation } from '@apollo/react-hooks';
import { useQuery } from '@apollo/client';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { v4 } from 'uuid';
import * as yup from "yup";

import VideoDetailModalView from "./VideoDetailModalCreateView";
import { setSpaceToDash } from "helpers/mixins";
import { POST_CREATE_COLLECTION, GET_LIST_COLLECTIONS } from "../modal/queries"

type Props = {
  onFinish: () => void
  sortBy?: string,
  onSwitch: () => void
};

type Payload = {
  field: {
    title: string,
    image: string
  }
}
const VideoDetailModalCreateContainer = (props: Props) => {
  const {
    sortBy = 'id',
    onFinish,
    onSwitch
  } = props
  const { loading, error, data } = useQuery(GET_LIST_COLLECTIONS, {
    fetchPolicy: "no-cache",
    variables: {
      sortBy,
      slug: ''
    },
  }) 
  const collections = data && data.getListCollection ? data.getListCollection : []
  const [postCreateCollection] = useMutation(POST_CREATE_COLLECTION, {
    fetchPolicy: "no-cache",
    refetchQueries: [
      GET_LIST_COLLECTIONS, // DocumentNode object parsed with gql
      'getListCollection' // Query name
    ],
  });
  let defaultValues = {
    field: {
      title: '',
      image: ''
    }
  };
  const schema = yup
    .object({
      field: yup.object({
        title: yup.string()
          .required('Title is required')
          .matches(/^'?\p{L}+(?:[' ]\p{L}+)*'?$/u, 'doesn’t have special Char'),
        image: yup.string()
      }),
    })
    .required();
  const handleSave = (val: Payload) => {
    let bool = true
    if (!val?.field) {
      setError('field.title',  { type: "focus", message: 'Field is required'});
      bool = false
    } else if (collections && val?.field?.title && 
      collections.indexOf((el: any) => el?.title && 
      setSpaceToDash(el.title) === setSpaceToDash(val?.field?.title)) > -1) {
      setError('field.title',  { type: "focus", message: 'Title already exists'});
      bool = false
    }
    if (bool) {
      postCreateCollection({
        variables: {
            ...val.field,
            id: v4(),
            type: 'drama',
            isActive: true,
            slug: setSpaceToDash(val.field.title)
          } 
        },
      ).then((val: any) => {
        onFinish()
        reset()
      });
    }
  }
  const handleSwitchModal = () => {
    onSwitch()
  }
  const {
    setError,
    control,
    handleSubmit,
    formState,
    reset
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
  });
  const { errors, isDirty } = formState;
  const obj = {
    handleSubmit,
    handleSave,
    handleSwitchModal,
    isDirty,
    errors,
    loading,
    error,
    control,
    collections
  };
  return <VideoDetailModalView {...obj} />;
};

export default VideoDetailModalCreateContainer;
