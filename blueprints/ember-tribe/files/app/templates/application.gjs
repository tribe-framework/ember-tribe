import { pageTitle } from 'ember-page-title';

<template>
  {{pageTitle "<%= classifiedPackageName %>"}}
  {{outlet}}
</template>
