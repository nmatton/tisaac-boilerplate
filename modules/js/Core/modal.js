/*
 * Modal component that works like popin dialog
 * To have the same styling as the BGA ones, use the style at the end of this file
 */

define(['dojo', 'dojo/_base/declare', 'dojo/fx', 'dojox/fx/ext-dojo/complex'], function (dojo, declare) {
  /**
   * Configuration object for the modal module.
   *
   * @typedef {Object} CONFIG
   * @property {string} container - The container element ID where the modal will be appended.
   * @property {string} class - The CSS class name for the modal.
   * @property {boolean} autoShow - Determines whether the modal should be automatically shown when created.
   * @property {string} modalTpl - The HTML template for the modal.
   * @property {string} closeIcon - The CSS class name for the close icon. Set to null if no icon is needed.
   * @property {string} closeIconTpl - The HTML template for the close icon.
   * @property {string} closeAction - The action to be performed when the close icon or underlay is clicked. Can be 'destroy' or 'hide'.
   * @property {boolean} closeWhenClickOnUnderlay - Determines whether the modal should be closed when the underlay is clicked.
   * @property {string} helpIcon - The CSS class name for the help icon. Set to null if no icon is needed.
   * @property {string} helpLink - The link URL for the help icon.
   * @property {string} helpIconTpl - The HTML template for the help icon.
   * @property {string} title - The title of the modal. Set to null if no title is needed.
   * @property {string} titleTpl - The HTML template for the title.
   * @property {string} contentsTpl - The HTML template for the contents of the modal.
   * @property {string} contents - The contents of the modal.
   * @property {string} verticalAlign - The vertical alignment of the modal. Can be 'top', 'center', or 'bottom'.
   * @property {number} animationDuration - The duration of the modal animation in milliseconds.
   * @property {boolean} fadeIn - Determines whether the modal should fade in when shown.
   * @property {boolean} fadeOut - Determines whether the modal should fade out when hidden.
   * @property {boolean} openAnimation - Determines whether the modal should have an open animation.
   * @property {string} openAnimationTarget - The target element ID for the open animation.
   * @property {number} openAnimationDelta - The delta value for the open animation.
   * @property {function} onShow - The callback function to be executed when the modal is shown.
   * @property {function} onHide - The callback function to be executed when the modal is hidden.
   * @property {string} statusElt - The element ID to add/remove the "opened" class on.
   * @property {number} scale - The scale value for the modal.
   * @property {number} breakpoint - The breakpoint value for auto resizing the modal.
   * @property {number} vscale - The vertical scale value for the modal.
   * @property {number} vbreakpoint - The vertical breakpoint value for auto resizing the modal.
   */
  const CONFIG = {
    container: 'ebd-body',
    class: 'custom_popin',
    autoShow: false,

    modalTpl: `
      <div id='popin_\${id}_container' class="\${class}_container">
        <div id='popin_\${id}_underlay' class="\${class}_underlay"></div>
        <div id='popin_\${id}_wrapper' class="\${class}_wrapper">
          <div id="popin_\${id}" class="\${class}">
            \${titleTpl}
            \${closeIconTpl}
            \${helpIconTpl}
            \${contentsTpl}
          </div>
        </div>
      </div>
    `,

    closeIcon: 'fa-times-circle', // Set to null if you don't want an icon
    closeIconTpl:
      '<a href="#" id="popin_${id}_close" class="${class}_closeicon"><i class="fa ${closeIcon} fa-2x" aria-hidden="true"></i></a>',
    closeAction: 'destroy', // 'destroy' or 'hide', it's used both for close icon and click on underlay
    closeWhenClickOnUnderlay: true,

    helpIcon: null, // Default icon for BGA was 'fa-question-circle-o',
    helpLink: '#',
    helpIconTpl:
      '<a href="${helpLink}" target="_blank" id="popin_${id}_help" class="${class}_helpicon"><i class="fa ${helpIcon} fa-2x" aria-hidden="true"></i></a>',

    title: null, // Set to null if you don't want a title
    titleTpl: '<h2 id="popin_${id}_title" class="${class}_title">${title}</h2>',

    contentsTpl: `
        <div id="popin_\${id}_contents" class="\${class}_contents">
          \${contents}
        </div>`,
    contents: '',

    verticalAlign: 'center',

    animationDuration: 500,

    fadeIn: true,
    fadeOut: true,

    openAnimation: false,
    openAnimationTarget: null,
    openAnimationDelta: 200,

    onShow: null,
    onHide: null,

    statusElt: null, // If specified, will add/remove "opened" class on this element

    scale: 1,
    breakpoint: null, // auto resize if < breakpoint using scale
    vscale: 1,
    vbreakpoint: null,
  };

  return declare('customgame.modal', null, {
    _open: false,
    /**
     * Checks if the modal is currently displayed.
     *
     * @returns {boolean} True if the modal is displayed, false otherwise.
     */
    isDisplayed() {
      return this._open;
    },
    /**
     * Checks if the modal is created.
     *
     * @returns {boolean} True if the modal is created, false otherwise.
     */
    isCreated() {
      return this.id != null;
    },

    /**
     * Creates a modal instance.
     *
     * @param {string} id - The ID of the modal.
     * @param {object} config - The configuration object for the modal.
     * @throws {string} - Throws an error if the ID is not provided.
     */
    constructor(id, config) {
      if (typeof id == 'undefined') {
        console.error('You need an ID to create a modal');
        throw 'You need an ID to create a modal';
      }
      this.id = id;

      // Load other parameters
      for (var setting in CONFIG) {
        this[setting] = typeof config[setting] == 'undefined' ? CONFIG[setting] : config[setting];
      }

      // Create the DOM elements
      this.create();
      if (this.autoShow) this.show();
    },

    /**
     * Create : create underlay and modal div, and contents
     */
    create() {
      dojo.destroy('popin_' + this.id + '_container');
      let titleTpl = this.title == null ? '' : dojo.string.substitute(this.titleTpl, this);
      let closeIconTpl = this.closeIcon == null ? '' : dojo.string.substitute(this.closeIconTpl, this);
      let helpIconTpl = this.helpIcon == null ? '' : dojo.string.substitute(this.helpIconTpl, this);
      let contentsTpl = dojo.string.substitute(this.contentsTpl, this);

      let modalTpl = dojo.string.substitute(this.modalTpl, {
        id: this.id,
        class: this.class,
        titleTpl,
        closeIconTpl,
        helpIconTpl,
        contentsTpl,
      });

      dojo.place(modalTpl, this.container);

      // Basic styling
      dojo.style('popin_' + this.id + '_container', {
        display: 'none',
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%',
      });

      dojo.style('popin_' + this.id + '_underlay', {
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%',
        zIndex: 1049,
        opacity: 0,
        backgroundColor: 'white',
      });

      dojo.style('popin_' + this.id + '_wrapper', {
        position: 'absolute',
        left: '0px',
        top: '0px',
        width: 'min(100%,100vw)',
        height: '100vh',
        zIndex: 1050,
        opacity: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: this.verticalAlign,
        paddingTop: this.verticalAlign == 'center' ? 0 : '125px',
        transformOrigin: 'top left',
      });

      this.adjustSize();
      this.resizeListener = dojo.connect(window, 'resize', () => this.adjustSize());

      // Connect events
      if (this.closeIcon != null && $('popin_' + this.id + '_close')) {
        dojo.connect($('popin_' + this.id + '_close'), 'click', () => this[this.closeAction]());
      }
      if (this.closeWhenClickOnUnderlay) {
        dojo.connect($('popin_' + this.id + '_underlay'), 'click', () => this[this.closeAction]());
        dojo.connect($('popin_' + this.id + '_wrapper'), 'click', () => this[this.closeAction]());
        dojo.connect($('popin_' + this.id), 'click', (evt) => evt.stopPropagation());
      }
    },

    /**
     * Adjusts the size of the modal container based on its content and breakpoints.
     */
    adjustSize() {
      let bdy = dojo.position(this.container);
      dojo.style('popin_' + this.id + '_container', {
        width: bdy.w + 'px',
        height: bdy.h + 'px',
      });

      let modalScale = 1;
      if (this.breakpoint != null) {
        let newModalWidth = bdy.w * this.scale;
        modalScale = Math.min(modalScale, newModalWidth / this.breakpoint);
      }
      if (this.vbreakpoint != null) {
        let newModalHeight = (window.innerHeight - 125) * this.vscale;
        modalScale = Math.min(modalScale, newModalHeight / this.vbreakpoint);
      }
      if (modalScale < 1) {
        dojo.style('popin_' + this.id, {
          transform: `scale(${modalScale})`,
          transformOrigin: this.verticalAlign == 'center' ? 'center center' : 'top center',
        });
      }
    },

    /**
     * Returns the coordinates of the opening target center.
     *
     * @returns {Object} The coordinates of the opening target center.
     * @property {number} x - The x-coordinate of the center.
     * @property {number} y - The y-coordinate of the center.
     */
    getOpeningTargetCenter() {
      var startTop, startLeft;
      if (this.openAnimationTarget == null) {
        startLeft = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 2;
        startTop = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 2;
      } else {
        let target = dojo.position(this.openAnimationTarget);
        startLeft = target.x + target.w / 2;
        startTop = target.y + target.h / 2;
      }

      return {
        x: startLeft,
        y: startTop,
      };
    },

    /**
     * Fadein promise
     *
     * @returns {Promise} A promise that resolves when the fadein animation is done.
     */
    fadeInAnimation() {
      return new Promise((resolve, reject) => {
        let containerId = 'popin_' + this.id + '_container';
        if (!$(containerId)) reject();

        if (this._runningAnimation) this._runningAnimation.stop();
        let duration = this.fadeIn ? this.animationDuration : 0;
        var animations = [];

        // Modals fade in
        animations.push(
          dojo.fadeIn({
            node: 'popin_' + this.id + '_wrapper',
            duration: duration,
          }),
        );
        // Underlay fade in background
        animations.push(
          dojo.animateProperty({
            node: 'popin_' + this.id + '_underlay',
            duration: duration,
            properties: { opacity: { start: 0, end: 0.7 } },
          }),
        );

        // Opening animation
        if (this.openAnimation) {
          var pos = this.getOpeningTargetCenter();
          animations.push(
            dojo.animateProperty({
              node: 'popin_' + this.id + '_wrapper',
              properties: {
                transform: { start: 'scale(0)', end: 'scale(1)' },
                top: { start: pos.y, end: 0 },
                left: { start: pos.x, end: 0 },
              },
              duration: this.animationDuration + this.openAnimationDelta,
            }),
          );
        }

        // Create the overall animation
        this._runningAnimation = dojo.fx.combine(animations);
        dojo.connect(this._runningAnimation, 'onEnd', () => resolve());
        this._runningAnimation.play();
        setTimeout(() => {
          if ($('popin_' + this.id + '_container')) dojo.style('popin_' + this.id + '_container', 'display', 'block');
        }, 10);
      });
    },

    /**
     * Shows the modal.
     */
    show() {
      if (this._isOpening) return;

      if (this.statusElt !== null) {
        dojo.addClass(this.statusElt, 'opened');
      }

      this.adjustSize();
      this._isOpening = true;
      this._isClosing = false;
      this.fadeInAnimation().then(() => {
        if (!this._isOpening) return;

        this._isOpening = false;
        this._open = true;
        if (this.onShow !== null) {
          this.onShow();
        }
      });
    },

    /**
     * Fadeout promise
     *
     * @returns {Promise} A promise that resolves when the fadeout animation is done.
     */
    fadeOutAnimation() {
      return new Promise((resolve, reject) => {
        let containerId = 'popin_' + this.id + '_container';
        if (!$(containerId)) reject();
        if (this._runningAnimation) this._runningAnimation.stop();

        let duration = this.fadeOut ? this.animationDuration + (this.openAnimation ? this.openAnimationDelta : 0) : 0;
        var animations = [];

        // Modals fade out
        animations.push(
          dojo.fadeOut({
            node: 'popin_' + this.id + '_wrapper',
            duration: duration,
          }),
        );
        // Underlay fade out background
        animations.push(
          dojo.animateProperty({
            node: 'popin_' + this.id + '_underlay',
            duration: duration,
            properties: { opacity: { start: 0.7, end: 0 } },
          }),
        );

        // Closing animation
        if (this.openAnimation) {
          var pos = this.getOpeningTargetCenter();
          animations.push(
            dojo.animateProperty({
              node: 'popin_' + this.id + '_wrapper',
              properties: {
                transform: { start: 'scale(1)', end: 'scale(0)' },
                top: { start: 0, end: pos.y },
                left: { start: 0, end: pos.x },
              },
              duration: this.animationDuration,
            }),
          );
        }

        // Create the overall animation
        this._runningAnimation = dojo.fx.combine(animations);
        dojo.connect(this._runningAnimation, 'onEnd', () => resolve());
        this._runningAnimation.play();
      });
    },

    /**
     * Hide : hide the modal without destroying it
     */
    hide() {
      if (this._isClosing) return;

      this._isClosing = true;
      this._isOpening = false;
      this.fadeOutAnimation().then(() => {
        if (!this._isClosing || this._isOpening) return;
        this._isClosing = false;
        this._open = false;

        dojo.style('popin_' + this.id + '_container', 'display', 'none');

        if (this.onHide !== null) {
          this.onHide();
        }

        if (this.statusElt !== null) {
          dojo.removeClass(this.statusElt, 'opened');
        }
      });
    },

    /**
     * Destroy : destroy the object and all DOM elements
     */
    destroy() {
      if (this._isClosing) return;

      this._isOpening = false;
      this._isClosing = true;
      this.fadeOutAnimation().then(() => {
        if (!this._isClosing || this._isOpening) return;
        this._isClosing = false;
        this._open = false;

        this.kill();
      });
    },

    /**
     * Kill : destroy the object and all DOM elements
     */
    kill() {
      if (this._runningAnimation) this._runningAnimation.stop();
      let underlayId = 'popin_' + this.id + '_container';
      dojo.destroy(underlayId);

      dojo.disconnect(this.resizeListener);
      this.id = null;

      if (this.statusElt !== null) {
        dojo.removeClass(this.statusElt, 'opened');
      }
    },
  });
});

/*

.custom_popin {
  position:relative;
  max-width: 1000px;
  min-width: 300px;
//  width: auto;
  width:70%;
  box-sizing: border-box;
  background: linear-gradient(to bottom, #f8f8f8, #e7e9e8);
  border: 2px black solid;
  border-radius: 8px;
  padding: 1%;
}
.mobile_version .custom_popin {
 padding: 10px;
}

.custom_popin_title {
 font-size: 150%;
 padding-right: 90px;
}
.mobile_version .custom_popin_title {
 font-size: 120%;
}


.custom_popin_closeicon,
.custom_popin_helpicon {
 position: absolute;
 top: 5px;
 color: black !important;
 right: 8px;
 font-size: 134%;
}
.custom_popin_helpicon {
 right: 47px;
}
.notouch-device .custom_popin_closeicon:hover,
.notouch-device .custom_popin_helpicon:hover {
 color: #555555 !important;
}
*/
