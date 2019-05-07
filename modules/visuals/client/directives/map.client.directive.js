(function () {
  'use strict';

  angular.module('visuals')
    .directive('map', ['d3', function(d3) {
      return {
        restrict: 'EA',
        scope: {
          data: '=',
          filtervalues: '@',
          min: '@',
          max: '@',
          vmdata: '@',
          title: '@',
          onClick: '&'
        },
        controller: function($scope, d3) {


          // catch the data and draw it on the map
          $scope.addDataToMap = function(data) {
            if (data) {
              $scope.values = JSON.parse($scope.filtervalues);
              $scope.projectDataOnMap({ type: 'FeatureCollection', features: data });
              $scope.extractMapValues(data);
              $scope.buildLevels();
              $scope.drawMap(data);
              $scope.addLegend();
            }
          };

          // update the maps projection (zoom and center) based on the extents of the data
          $scope.projectDataOnMap = function (data) {
            $scope.projection.scale(1).translate([0, 0]);

            var b = $scope.path.bounds(data),
              s = 0.95 / Math.max((b[1][0] - b[0][0]) / $scope.width, (b[1][1] - b[0][1]) / $scope.width),
              t = [($scope.width - s * (b[1][0] + b[0][0])) / 2, ($scope.height - s * (b[1][1] + b[0][1])) / 2];

            $scope.projection.scale(s).translate(t);
          };

          // store the mapValues that are drawn on the map
          $scope.mapValues = [];
          $scope.extractMapValues = function (data) {
            $scope.mapValues = data.map(function (d) {

              return $scope.get_value(d);
            });
          };

          $scope.buildLevels = function() {
            var vmdata = JSON.parse($scope.vmdata);

            var range = { min: 0, max: 100 };
            var mapValuesMax = Math.max(...$scope.mapValues);
            if ((vmdata.chartFormat === 'count' || vmdata.chartFormat === 'per_capita') && vmdata.mapResults) {
              range.max = mapValuesMax > 10 ? mapValuesMax : 10;
            }

            $scope.levels = $scope.range_to_levels(range, $scope.steps);
          };

          // draw the data onto the map
          $scope.drawMap = function(data) {

            // remove previous paths only
            $scope.map.selectAll('path').data(data).remove();

            // then add the new content
            $scope.map.selectAll('path')
              .data(data)
              .enter()
              .append('path')
              .attr('d', $scope.path)
              .style('stroke', '#000')
              .style('cursor', 'pointer')
              .style('stroke-width', '1')
              .style('fill', $scope.color_path)
              .attr('data-value', $scope.get_value)
              .on('click', $scope.catch_mouse_click)
              .on('mouseout', $scope.catch_mouse_out)
              .on('mouseover', $scope.catch_mouse_over);
          };

          // catch a click on an map element and do something
          $scope.catch_mouse_click = function(d, i) {
            var tractQuery;
            if ($scope.clickedMapPolyId === i) {
              tractQuery = null;
              $scope.clickedMapPolyId = null;
            } else {
              // store the data for the polyon that is clicked
              $scope.clickedMapPolyId = i;
              tractQuery = d.properties.tractce;
            }
            $scope.onClick()(tractQuery);
          };

          // draw a new little popup div on mouseover
          $scope.catch_mouse_over = function(d, i, elems) {

            var value = parseFloat(elems[i].dataset.value).toFixed(2, 10);
            value = value === 'NaN' ? 'no data' : value;
            var tooltip_label = `<b>Tract: ${d.properties.tractce}</b><br/>`;
            var vmdata = JSON.parse($scope.vmdata);
            if (vmdata.chartFormat === 'count') {
              tooltip_label += 'Rate: ';
            } else {
              tooltip_label += 'Percent: ';
            }
            tooltip_label += `${value}`;

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

          // build out the legend
          $scope.addLegend = function() {
            var legendRectSize = 15;
            var legendSpacing = 15;
            var color_domain = $scope.color.domain;

            var legend_items = $scope.legend.selectAll('.legend')
              .data($scope.levels)
              .enter()
              .append('g')
              .attr('class', 'legend')
              .attr('transform', function(d, i) {
                var width = legendRectSize + legendSpacing;
                var vert = 0;
                var horz = i * width;
                return 'translate(' + horz + ',' + vert + ')';
              });

            legend_items.append('rect')
              .attr('width', legendRectSize)
              .attr('height', legendRectSize)
              .style('fill', $scope.color_from_value)
              .style('stroke', $scope.color_from_value);

            legend_items.append('text')
              .attr('x', legendRectSize + legendSpacing)
              .attr('y', legendRectSize - legendSpacing)
              .style('font-size', '11px')
              .attr('transform', 'translate(' + (-1 * (legendRectSize + legendSpacing)) + ',' + (legendRectSize + legendSpacing) + ' )')
              .text(function(d) {
                return parseInt(d, 10);
              });
          };

          // return an array of fixed width levels based on range and steps
          $scope.range_to_levels = function(range, steps) {
            var step = (range.max - range.min) / steps;
            var levels = new Array(steps);
            for (var i = levels.length - 1; i >= 0; i--) {
              levels[i] = (i + 1) * step + range.min;
            }
            return levels;
          };

          $scope.get_value = function(data) {
            var vmdata = JSON.parse($scope.vmdata);
            var value = $scope.values.filter(function(x) {return x.label === data.properties.tractce;})[0];
            if (value && value.value && value.value > 5) {
              var plot_value = value.value;
              if (vmdata.chartFormat === 'count') {
                plot_value = $scope.per_capita(value.value, data.properties.total_pop_2010);
              }
              return plot_value;
            } else {
              return null;
            }
          };

          // compute n_deaths per capita
          // determine the color of the new path a
          $scope.color_path = function(data) {

            var color = $scope.get_value(data);
            if (color) {
              return $scope.color_from_value(color);
            } else {
              return $scope.nodata;
            }
          };

          // helper for returning per capita values
          // normal per capita is per 100,000
          $scope.per_capita = function(count, population) {
            return (count / population) * 100000.0;
          };

          // return a color from a value
          $scope.color_from_value = function(value) {
            var no_data = $scope.nodata;
            if (value > 0) {
              // If value exists…
              var value_level = 0;
              $scope.levels.forEach(function(l, i) {
                if (l < value) {
                  value_level = i;
                }
              });
              return $scope.color(value_level);
            } else {
              // If value is undefined…
              return no_data;
            }
          };
        },
        link: function(scope, iElement, iAttrs) {
          scope.map = d3.select(iElement[0])
              .append('svg')
              .attr('width', '100%');

          scope.legend = d3.select('#legend')
            .append('svg')
            .attr('width', '100%')
            .attr('height', 50);

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

          // watch for data changes and re-render
          scope.$watch('vmdata', function(newVals, oldVals) {
            return scope.render(newVals);
          }, true);

          // define render function
          scope.render = function(data) {
            // dump old map content first
            scope.nodata = 'rgb(240,240,240)';
            scope.legend.selectAll('*').remove();

            var margin = { top: 0, right: 10, bottom: 0, left: 20 };
            scope.width = parseInt(scope.map.style('width'), 10) - margin.left - margin.right;
            scope.height = parseInt(scope.width / 1.05, 10) - margin.top - margin.bottom;

            // set map height responsively based on page width
            scope.map.attr('height', scope.height + margin.top + margin.bottom);

            scope.map.append('g')
              .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

            scope.projection = d3.geoConicConformal()
              .parallels([38 + 18 / 60, 39 + 27 / 60])
              .rotate([77, -37 - 40 / 60]);
            scope.path = d3.geoPath().projection(scope.projection);


            scope.steps = 10;
            var low_color = '#a4e0ea';
            var high_color = '#0b4751';
            scope.color = d3.scaleLinear()
                          .domain([0, scope.steps - 1])
                          .range([low_color, high_color]);

            d3.json('/api/geo/census-tracts/features', scope.addDataToMap);
          };
        }
      };
    }]);
}());
