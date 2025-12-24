import Component from '@glimmer/component';

export default class WelcomeFlameComponent extends Component {
  <template>
    <section class="flame-bg d-flex align-items-center justify-content-center">
      <div class="py-6 container px-0 text-center text-dark">
        <img src="/assets/img/flame.png" width="200">
      </div>
    </section>
  </template>
}
