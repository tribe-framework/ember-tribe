import { htmlSafe } from '@ember/template';
import { eq, and, not } from 'ember-truth-helpers';

const html = (value) => htmlSafe(value);

<template>
  {{#if (eq @entry.type "paragraph")}}
    <p>{{html @entry.data.text}}</p>

  {{else if (eq @entry.type "header")}}
    <h5>{{html @entry.data.text}}</h5>

  {{else if (eq @entry.type "list")}}
    {{#if (eq @entry.data.style "unordered")}}
      <ul>
        {{#each @entry.data.items as |item|}}
          <li>{{html item}}</li>
        {{/each}}
      </ul>
    {{else}}
      <ol>
        {{#each @entry.data.items as |item|}}
          <li>{{html item}}</li>
        {{/each}}
      </ol>
    {{/if}}

  {{else if (eq @entry.type "table")}}
    <table class="table mb-4">
      {{#each @entry.data.content as |row index|}}
        {{#if (and @entry.data.withHeadings (eq index 0))}}
          <thead><tr>
              {{#each row as |cell|}}
                <th scope="col">{{cell}}</th>
              {{/each}}
            </tr></thead>
        {{/if}}
      {{/each}}
      {{#each @entry.data.content as |row index|}}
        <tbody>
          {{#if (not (and @entry.data.withHeadings (eq index 0)))}}
            <tr>
              {{#each row as |cell index|}}
                {{#if (and @entry.data.withHeadings (eq index 0))}}
                  <th scope="row">{{cell}}</th>
                {{else}}
                  <td>{{cell}}</td>
                {{/if}}
              {{/each}}
            </tr>
          {{/if}}
        </tbody>
      {{/each}}
    </table>

  {{else if (eq @entry.type "quote")}}
    <blockquote
      class="my-5 fst-italic display-6 lh-lg fs-4 border-start border-5 border-secondary text-secondary ps-3"
    >{{html @entry.data.text}}</blockquote>

  {{else if (eq @entry.type "image")}}
    <figure id={{@entry.id}} class="mb-3">
      <img src={{@entry.data.file.url}} class="image-fluid" alt="" />
      {{#if @entry.data.caption}}
        <figcaption class="small text-muted mt-2 col-lg-10 me-0 ms-auto">{{html
            @entry.data.caption
          }}</figcaption>
      {{/if}}
    </figure>

  {{else if (eq @entry.type "raw")}}
    <div id={{@entry.id}} class="w-100 mb-2 editorjs-raw-html">{{html
        @entry.data.html
      }}</div>
  {{/if}}
</template>
