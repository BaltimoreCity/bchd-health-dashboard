(function () {
  'use strict';

  angular.module('visuals')
    .directive('verticalBars', ['d3', function(d3) {
      return {
        restrict: 'EA',
        scope: {
          currentStartDate: '@',
          currentEndDate: '@',
          vmdata: '@',
          data: '=',
          title: '@',
          label: '=',
          columns: '=',
          min: '=',
          max: '=',
          onClick: '&'
        },
        controller: function($scope, d3) {
          // catch a click on an chart bar and do something
          $scope.catch_mouse_click = function(d, i) {

            var queryStartDate,
              queryEndDate;

            if ($scope.clickedBar === d.label) {
              $scope.clickedBar = null;
              queryStartDate = $scope.lastStartDate;
              queryEndDate = $scope.lastEndDate;
            } else {
              // save the previous state
              $scope.lastStartDate = new Date($scope.currentStartDate.replace(/"/g, ''));
              $scope.lastEndDate = new Date($scope.currentEndDate.replace(/"/g, ''));
              // store the data for the polyon that is clicked
              $scope.clickedBar = d.label;
              queryStartDate = moment(d.label, 'MMM YYYY').toDate();
              queryEndDate = queryStartDate;
            }
            $scope.onClick()(queryStartDate, queryEndDate);
          };

          // draw a new little popup div on mouseover
          $scope.catch_mouse_over = function(d, i, elems) {
            var tooltip_label = `<b>${d.label}</b><br/>`;
            var vmdata = JSON.parse($scope.vmdata);

            if (vmdata.chartFormat === 'count') {
              tooltip_label += 'Count: ';
            } else {
              tooltip_label += 'Percent: ';
            }
            tooltip_label += `${d.value}`;

            $scope.tooltip.transition()
              .duration(200)
              .style('opacity', 0.9);
            $scope.tooltip.html(tooltip_label)
              .style('left', d3.event.pageX + 'px')
              .style('top', (d3.event.pageY - 28) + 'px');
          };

          // remove the popup on mouse out
          $scope.catch_mouse_out = function(d, i, elems) {
            $scope.tooltip
              .transition()
              .duration(500)
              .style('opacity', 0);
          };
        },
        link: function(scope, iElement, iAttrs) {
          scope.svg = d3.select(iElement[0])
              .append('svg')
              .attr('width', '100%');

          scope.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

          // on window resize, re-render d3 canvas
          window.onresize = function() {
            return scope.$apply();
          };
          scope.$watch(function() {
            return angular.element(window)[0].innerWidth;
          }, function() {
            return scope.render(scope.data);
          });

          scope.$watch('max', function(newValue, oldValue) {
            if (newValue !== oldValue) {
              scope.render(scope.data);
            }
          });

          // watch for data changes and re-render
          scope.$watch('data', function(newVals, oldVals) {
            return scope.render(newVals);
          }, true);

          scope.$watch('columns', function(newVals, oldVals) {
            return scope.render(scope.data);
          }, true);

          // define render function
          scope.render = function(data) {
            // remove all previous items before render
            scope.svg.selectAll('*').remove();

            var svg_width = parseInt(scope.svg.style('width'), 10);
            var svg_height = parseInt(svg_width / 2.75, 10);

            // setup variables
            var margin = { top: 60, right: 30, bottom: 15, left: 40 };
            var height = svg_height - margin.top - margin.bottom;
            var width = svg_width - margin.left - margin.right;

              // 20 is for margins and can be changed
              // 35 = 30(bar height) + 5(margin between bars)
              // this can also be found dynamically when the data is not static
              // max = Math.max.apply(Math, _.map(data, ((val)-> val.count)))
            scope.xScale = d3.scaleBand().domain(scope.columns).range([0, width]);
            scope.yScale = d3.scaleLinear().range([height, 0]).domain([scope.min, scope.max]).nice();

            // set the height based on the calculations above

            scope.svg.attr('height', height + margin.top + margin.bottom);

            var format;
            if (scope.label === 'percent') {
              format = function(d) { return d + '%'; };
            } else {
              format = function(d) { return d; };
            }

            // Create Axes
            scope.yAxis = d3.axisLeft(scope.yScale).tickFormat(format);
            scope.xAxis = d3.axisBottom(scope.xScale);

            // Y AXIS ticks and tick labels
            scope.svg.append('g')
              .attr('class', 'y axis')
              .attr('transform', 'translate(' + margin.left + ',' + 10 + ')')
              .style('font-size', '10px')
              .call(scope.yAxis);

            // Y AXIS text label
            scope.svg.append('text')
              .attr('transform', 'rotate(-90)')
              .attr('y', 10)
              .attr('x', 0 - ((height + 10) / 2))
              .attr('dy', '0.1em')
              .style('text-anchor', 'middle')
              .style('font-size', '10px');

            // X AXIS ticks and tick labels
            scope.svg.append('g')
              .attr('class', 'xaxis axis')
              .attr('transform', 'translate(' + margin.left + ',' + (height + 10) + ')')
              .call(scope.xAxis)
              .selectAll('text')
                .attr('display', function(d, i, list) {
                  if (list.length > 12) {
                    if (i % 6 !== 0) {
                      return 'none';
                    }
                  }
                })
                .attr('x', '-10')
                .attr('y', '-3')
                .attr('transform', 'rotate(-90)')
                .style('text-anchor', 'end')
                .style('font-size', '10px');

            // BARS
            var bar_spacing = 0.75;
            scope.svg.selectAll('.bar')
              .data(scope.data)
              .enter().append('rect')
              .attr('class', 'bar')
              .attr('transform', 'translate(' + margin.left + ',' + 10 + ')')
              .attr('x', function(d) { if (d.value) { return scope.xScale(d.label) + bar_spacing; } })
              .attr('width', scope.xScale.bandwidth() - bar_spacing)
              .attr('y', function(d) { return scope.yScale(d.value); })
              .attr('height', function(d) {
                var barHeight = height - scope.yScale(d.value);
                return barHeight > 1 ? barHeight : 1;
              })
              .on('click', scope.catch_mouse_click)
              .on('mouseout', scope.catch_mouse_out)
              .on('mouseover', scope.catch_mouse_over);
          };
        }
      };
    }]);
}());
