import React from 'react'

import moment from 'moment'
import * as d3 from 'd3'

class CalendarHeatmap extends React.Component {

  constructor(props) {
    super(props)

    this.settings = {
      gutter: 5,
      item_gutter: 1,
      width: 1000,
      height: 200,
      item_size: 10,
      label_padding: 40,
      max_block_height: 20,
      transition_duration: 500,
      tooltip_width: 250,
      tooltip_padding: 15,
    }

    this.in_transition = false
    this.history = ['global']
    this.selected = {}

    this.calcDimensions = this.calcDimensions.bind(this)
  }

  componentDidMount() {
    this.createElements()
    this.parseData()
    this.drawChart()

    window.addEventListener('resize', this.calcDimensions)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.calcDimensions)
  }

  createElements() {
    // Create svg element
    this.svg = d3.select('#calendar-heatmap')
      .append('svg')
      .attr('class', 'svg')

    // Create other svg elements
    this.items = svg.append('g')
    this.labels = svg.append('g')
    this.buttons = svg.append('g')

    // Add tooltip to the same element as main svg
    this.tooltip = d3.select('#calendar-heatmap')
      .append('div')
      .attr('class', 'heatmap-tooltip')
      .style('opacity', 0)

    this.calcDimensions()
  }

  // Calculate dimensions based on available width
  calcDimensions() {
    var dayIndex = Math.round((moment() - moment().subtract(1, 'year').startOf('week')) / 86400000)
    var colIndex = Math.trunc(dayIndex / 7)
    var numWeeks = colIndex + 1

    this.settings.width = container.offsetWidth < 1000 ? 1000 : container.offsetWidth
    this.settings.item_size = ((this.settings.width - this.settings.label_padding) / numWeeks - this.settings.gutter)
    this.settings.height = this.settings.label_padding + 7 * (this.settings.item_size + this.settings.gutter)
    this.attr('width', this.settings.width)
      .attr('height', this.settings.height)

    if ( !!this.data && !!this.data[0].summary ) {
      this.drawChart()
    }
  }

  parseData() {
    if ( !this.props.data ) { return }

    // Get daily summary if that was not provided
    if ( !this.props.data[0].summary ) {
      this.props.data.map(function(d) {
        var summary = d.details.reduce(function(uniques, project) {
          if (!uniques[project.name]) {
            uniques[project.name] = {
              'value': project.value
            }
          } else {
            uniques[project.name].value += project.value
          }
          return uniques
        }, {})
        var unsorted_summary = Object.keys(summary).map(function(key) {
          return {
            'name': key,
            'value': summary[key].value
          }
        })
        d.summary = unsorted_summary.sort(function(a, b) {
          return b.value - a.value
        })
        return d
      })
    }
  }

  drawChart() {
    if ( this.overview === 'global' ) {
      this.drawGlobalOverview()
    } else if ( this.overview === 'year' ) {
      this.drawYearOverview()
    } else if ( this.overview === 'month' ) {
      this.drawMonthOverview()
    } else if ( this.overview === 'week' ) {
      this.drawWeekOverview()
    } else if ( this.overview === 'day' ) {
      this.drawDayOverview()
    }
  }

  render() {
    return (
      <div id="calendar-heatmap"></div>
    )
  }
}

CalendarHeatmap.defaultProps = {
  data: [],
  overview: 'year',
  color: '#ff4500',
  handler: undefined,
}

export default CalendarHeatmap
