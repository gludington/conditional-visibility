import CONSTANTS from '../constants';

/**
 * Handles setting up all handlebar helpers
 */
export default class HandlebarHelpers {
  constructor() {}

  /**
   * Registers the handlebar helpers
   */
  registerHelpers() {
    this._registerCheckedIfHelper();
    // this._registerSelectHelper();
    // this._registerMultiSelectHelper();
    this._registerOptionsIsSelectedHelper();
    this._registerMultiSelectHelper2();
  }

  /**
   * @href https://stackoverflow.com/questions/13046401/how-to-set-selected-select-option-in-handlebars-template
   */
  _registerOptionsIsSelectedHelper() {
    Handlebars.registerHelper('isOptionSelected', function (value, options) {
      const optionValueToCheck = <string>options.fn(this);
      const currentValue = getProperty(options.data.root, value);
      if (currentValue && optionValueToCheck.toLowerCase().indexOf(currentValue?.toLowerCase()) >= 1) {
        return `${optionValueToCheck} selected='selected'`;
      } else {
        return `${optionValueToCheck}`;
      }
    });
  }

  // https://gist.github.com/LukeChannings/6173ab951d8b1dc4602e
  //   _registerMultiSelectHelper() {
  //     Handlebars.registerHelper('option', function (selected, option) {
  //       if (selected == undefined) {
  //         return '';
  //       }
  //       return selected.indexOf(option) !== -1 ? 'selected' : '';
  //     });
  //   }

  // https://gist.github.com/LukeChannings/6173ab951d8b1dc4602e
  //   _registerSelectHelper() {
  //     Handlebars.registerHelper('select', function (value, options) {
  //       return options
  //         .fn()
  //         .split('\n')
  //         .map(function (v) {
  //           const t = 'value="' + value + '"';
  //           return RegExp(t).test(v) ? v.replace(t, t + ' selected="selected"') : v;
  //         })
  //         .join('\n');
  //     });
  //   }

  _registerCheckedIfHelper() {
    Handlebars.registerHelper('checkedIf', function (condition) {
      return condition ? 'checked' : '';
    });
  }

  /**
   * Sets the 'selected' property on the select option(s) when the value is passed in.
   * @href https://gist.github.com/codeBelt/2e3db2ae6db24e86a9a6
   * @method selectHelper
   * @example
   *      // selectValue = "69"
   *      // selectValue = "69,70,71"
   *      <select>
   *          {{#selectHelper selectValue}}
   *              <option value="Completed">Completed</option>
   *              <option value="OverDue">OverDue</option>
   *              <option value="SentToPayer">SentToPayer</option>
   *              <option value="None">None</option>
   *          {{/selectHelper}}
   *      </select>
   *
   *      <select>
   *          {{#selectHelper selectValue}}
   *              {{#each senses as |sense|}}
   *              <option value="{{sense.id}}">{{localize senseData.name}}</option>
   *              {{/each}}
   *          {{/selectHelper}}
   *      </select>
   *
   */
  _registerMultiSelectHelper2() {
    Handlebars.registerHelper('selectHelper', function (selected, options) {
      let html = options.fn(this);
      // https://gist.github.com/codeBelt/2e3db2ae6db24e86a9a6
      const selectedTmp = String(selected);
      if (selectedTmp) {
        const values = selectedTmp.split(',');
        const length = values.length;

        for (let i = 0; i < length; i++) {
          html = html.replace(new RegExp(' value="' + values[i] + '"'), '$& selected="selected"');
        }
      }

      return html;
    });
  }
}
