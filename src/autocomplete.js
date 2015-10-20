var defaults = {
  templates: {
    autocomplete: '<div class="autocomplete"></div>'
  },

  selected: function(element) {

  },

  selectedClass: 'selected',

  select: function(event, data) {
    this.select(event, data);
  },

  sides: function(event) {
    this.sides(event);
  },

  move: function(event) {
    this.move(event);
  },

  source: function(query)
  {
    data = this.data;

    returnData = [];

    if (data.length > 0)
    {
      data.map(function(item, index) {
        regex = new RegExp(query, 'gi');
        if (item.search(regex) != -1)
        {
          returnData.push(item);
        }
      });

    }

    return this.fillAutocompleteList(query, data);
  },

  setResults: function(query)
  {
    return this.getData(query);
  },

  fillList: function(query, data) {
    return this.standardFiller(query, data);
  },

  timer: null,




};

function Autocomplete (element, options)
{
  this.element = element;
  this.$element = jQuery(this.element);
  this.options = jQuery.extend({}, defaults, options);
  this.options.selectedSelector = '.'+this.options.selectedClass
  this._defaults = defaults;

  this.initialize();
}

Autocomplete.prototype = {
  initialize: function() {

    this.generateUniqId();

    console.log('Autocomplete fired');

    this.data = [];

    this.$element.attr('autocomplete', 'off');

    if (this.$element.siblings('.input-group-addon').length > 0) {
      this.afterElement = this.$element[0].parentElement;
    }
    else {
      this.afterElement = this.element;
    }

    this.$afterElement = jQuery(this.afterElement);
    this.createAutocompleteField();
    this.setStandardListener();
  },

  generateUniqId: function()
  {
    var n = Math.floor(Math.random() * 11),
      k = Math.floor(Math.random() * 1000000);
    this.uniqid = String.fromCharCode(n)+k;
  },

  createAutocompleteField: function()
  {
    html = jQuery(this.options.templates.autocomplete).attr('id', 'autocomplete_'+this.uniqid);

    jQuery(this.$afterElement[0].parentElement).css('position', 'relative');
    this.$afterElement.after(html);
    id = 'autocomplete_'+this.uniqid;
    this.$autocompleteList = jQuery('div[id="'+id.replace(' ', '')+'"]');
  },

  setStandardListener: function()
  {
    var _this = this;

    this.$element.on('keyup.enter', function(event) {

      if (event.keyCode == 13)
      {
        event.preventDefault();

        $selected = _this.$autocompleteList.find(_this.options.selectedClass);

        _this.options.select.call(_this, event, $selected);

        return false;
      }
    });

    this.$element.on('keyup.sides', function (event) {
      if (event.keyCode == 37 || event.keyCode == 39)
      {
        console.log('left right');

        _this.options.sides.call(_this, event);

        return true;
      }
    });

    this.$element.on('keyup.move', function (event) {
      if (event.keyCode == 38 || event.keyCode == 40)
      {
        event.preventDefault();

        _this.options.move.call(_this, event);

        return false;
      }
    });

    this.$element.on('keyup.rest', function(event) {

      alreadyMappedKeys = [13, 37, 38, 39, 40];

      if (alreadyMappedKeys.filter(function(keyCode){ return keyCode === event.keyCode}).length === 0)
      {
        if (_this.$element.val().length > 1)
        {
          clearTimeout(_this.timer);
          _this.timer = setTimeout(function() {
            _this.setResults(_this.$element.val());
          }, 250);
        }
      }
    });

    this.$element.on('focus', function(event) {
      event.stopPropagation();
      event.preventDefault();
      _this.showAutocompleteList();

      return false;
    });

    jQuery(document).on('click', function(event) {
      $target = jQuery(event.target);

      if (!('autocomplete' in $target.data()) && !$target.parents('[id^=autocomplete_]').size())
      {
        _this.hideAutocompleteList();
      }
    });
  },

  hideAutocompleteList: function()
  {
    this.$autocompleteList.css('display', 'none');
  },

  showAutocompleteList: function()
  {
    this.$autocompleteList.css('display', 'block');
  },

  emptyAutocompleteList: function()
  {
    this.$autocompleteList.html('');
  },

  fillAutocompleteList: function(query, data)
  {
    this.showAutocompleteList();
    return this.options.fillList.call(this, query, data);
  },

  standardFiller: function(query, data)
  {
    var regex = new RegExp(query, 'gi');
    var html = '<ul>';

    if (data.length > 0)
    {
      data.map(function(item, index) {
        html +='<li>' + item.replace(regex, '<span style="font-weight: bold;">$&</span>') + '</li>';
      });
    }
    else
    {
      html += '<li>Geen resultaten gevonden</li>';
    }

    html += '</ul>'
    this.$autocompleteList.html(html);
  },

  getData: function(query)
  {
    var getType = {};
    if (getType.toString.call(this.options.source) === '[object Function]')
    {
      this.options.source.call(this, query, function(data) {
        return data;
      });
    }


    else {
      return this.options.source;
    }

  },

  setResults: function(query)
  {
    return this.options.setResults.call(this, query);
  },

  select: function(event, selected)
  {
    this.emptyAutocompleteList();
    return false;
  },

  sides: function(event)
  {

  },

  move: function(event)
  {
    $selected = this.$autocompleteList.find(this.options.selectedSelector);
    $resultUl = this.$autocompleteList.find('ul');
    $results = this.$autocompleteList.find('ul li');

    if ($selected.length > 0)
    {
      if (event.keyCode == 38)
      {
        if ($selected.is(':first-child'))
        {
          $selected.removeClass(this.options.selectedClass);
          $results.last().addClass(this.options.selectedClass);
        }
        else
        {
          $selected.removeClass(this.options.selectedClass).prev('li').addClass(this.options.selectedClass);
        }
      }
      else
      {
        if ($selected.is(':last-child'))
        {
          $selected.removeClass(this.options.selectedClass);
          $results.first().addClass(this.options.selectedClass);
        }
        else
        {
          $selected.removeClass(this.options.selectedClass).next('li').addClass(this.options.selectedClass);
        }
      }
    }
    else {
      if (event.keyCode == 38)
      {
        $results.last().addClass(this.options.selectedClass);
      }
      else
      {
        $results.first().addClass(this.options.selectedClass);
      }
    }
  }

}

jQuery.fn.extend({
  autocomplete: function(options, extraValue) {
    return this.each(function() {

      if ('autocomplete' in jQuery(this).data()) {

        $this = jQuery(this);
        $Autocomplete = $this.data('autocomplete');

        if (typeof options === 'string' && typeof $Autocomplete[options] === 'function') {
          return $Autocomplete[options](extraValue);
        }
        else if (options in $Autocomplete) {
          return $Autocomplete[options];
        }

        return $Autocomplete;
      }

      return jQuery.data(this, 'autocomplete', new Autocomplete(this, options));
    });
  }
});
