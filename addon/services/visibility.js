import Service from '@ember/service';
import { bind } from '@ember/runloop';
import { get } from '@ember/object';
import { isPresent } from '@ember/utils';

export const APIs = {
  global: { isSupported: true, hiddenFlag: 'hidden', eventName: 'visibilitychange' },
  webkit: { isSupported: true, hiddenFlag: 'webkitHidden', eventName: 'webkitvisibilitychange' },
  mozilla: { isSupported: true, hiddenFlag: 'mozHidden', eventName: 'mozvisibilitychange' },
  ie: { isSupported: true, hiddenFlag: 'msHidden', eventName: 'msvisibilitychange' },
  unsupported: { isSupported: false }
};

/**
 * This service keeps track of whether the window has ever lost visibility. This
 * happens when the user switches tabs, minimizes the window, etc.
 */
export default Service.extend({

  visible: true,

	lostVisibility: false,
	
		/**
	 * Returns visibility API support flag & flag / event names, depending on the
	 * user's browser.
	 *
	 * See also:
	 * https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
	 * https://whatwebcando.today/foreground-detection.html
	 *
	 * @property pageVisibilityAPI
	 * @type Object
	 */
	pageVisibilityAPI: computed(function() {
		if (isPresent(this.get('_document.hidden'))) {
			return {
				isSupported: true,
				flagName: 'hidden',
				eventName: 'visibilitychange'
			};
		}

		if (isPresent(this.get('_document.webkitHidden'))) {
			return {
				isSupported: true,
				flagName: 'webkitHidden',
				eventName: 'webkitvisibilitychange'
			};
		}

		if (isPresent(this.get('_document.mozHidden'))) {
			return {
				isSupported: true,
				flagName: 'mozHidden',
				eventName: 'mozvisibilitychange'
			};
		}

		if (isPresent(this.get('_document.msHidden'))) {
			return {
				isSupported: true,
				flagName: 'msHidden',
				eventName: 'msvisibilitychange'
			};
		}

		return { isSupported: false };
	}),

  init() {
    this._super(...arguments);

    const { isSupported, eventName } = this.get('pageVisibilityAPI');

    if (isSupported) {
      this._handleDocumentVisibilityChange();

      document.addEventListener(eventName, bind(this, '_handleDocumentVisibilityChange'));
    }
  },

  /**
   * Service teardown
   */
  willDestroy() {
    this._super(...arguments);

    this.removeBindings();
  },

  /**
   * Unsubscribes to events.
   */
  removeBindings() {
    const { isSupported, eventName } = this.get('pageVisibilityAPI');

    if (isSupported) {
      document.removeEventListener(eventName, this.get('_handleDocumentVisibilityChange'));
    }
  },

  /**
   * Event handler.
   */
  _handleDocumentVisibilityChange() {
    const hiddenFlagName = this.get('pageVisibilityAPI.hiddenFlag');
    const isHidden = get(document, hiddenFlagName);

    if (this.isDestroyed) { return; }

    this.set('visible', !isHidden);

    if (isHidden) {
      this.set('lostVisibility', true);
    }
  }
});
