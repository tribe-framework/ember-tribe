import Block from './editorjs/block';

<template>
  {{#each @jsondata.blocks as |block|}}
    <Block @entry={{block}} />
  {{/each}}
</template>
