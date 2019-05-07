(function () {
  'use strict';

  angular.module('visuals')
    .directive('pie', ['d3', function(d3) {
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
          // catch a click on a pie wedge and do something
          $scope.catch_mouse_click = function(d, i) {
            // if the same wedge is clicked again reset filters
            if ($scope.clickedBar === d.data.label) {
              $scope.clickedBar = null;
            } else {
              // store the data for the wedge that is clicked
              $scope.clickedBar = d.data.label;
            }
            $scope.onClick()($scope.clickedBar);
          };

          // draw a new little popup div on mouseover
          $scope.catch_mouse_over = function(d, i, elems) {
            var tooltip_label = `<b>${d.data.label}</b><br/>`;
            var vmdata = JSON.parse($scope.vmdata);

            var percent = Math.abs(d.endAngle - d.startAngle) / (2 * Math.PI) * 100;
            tooltip_label += `${percent.toFixed(1, 10)}%`;

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
          scope.$watch('data', function(newVals, oldVals) {
            return scope.render(newVals);
          }, true);

          // define render function
          scope.render = function(data) {
            if (!data)
              return;
            // remove all previous items before render
            if (scope.svg) {
              scope.svg.remove();
            }


            var steps = data.length;
            // CHANGE COLORS FOR PIE CHART HERE
            var low_color = '#82bec8';
            var high_color = '#0b4751';
            var color = d3.scaleLinear()
                          .domain([0, steps - 1])
                          .range([low_color, high_color]);

            scope.svg = d3.select(iElement[0]).append('svg')
            .attr('width', '100%')
            .attr('height', '100%');
            var domRect = iElement[0].getBoundingClientRect();
            var width = domRect.width;
            var height = domRect.width;
            var radius = Math.min(width, height) / 2;
            scope.svg.attr('width', width).attr('height', height);
            var pie = d3.pie().sort(null).value(function(d) { return d.value; });
            var path = d3.arc()
               .outerRadius(radius - 10)
               .innerRadius(radius * 0.35);

            var label = d3.arc()
              .outerRadius(radius * 0.6)
              .innerRadius(radius * 0.6);

            var group = scope.svg
               .append('g')
               .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

            var arc = group.selectAll('.arc')
              .data(pie(data))
              .enter().append('g')
                .attr('class', 'arc');

            arc.append('path')
              .attr('d', path)
              .attr('fill', function(d) { return color(d.index); })
              .on('click', scope.catch_mouse_click)
              .on('mouseout', scope.catch_mouse_out)
              .on('mouseover', scope.catch_mouse_over);


            arc.append('text')
              .attr('transform', function(d) { return 'translate(' + label.centroid(d) + ')'; })
              .attr('dy', '0.35em')
              .attr('font-size', '8pt')
              .attr('text-anchor', 'middle')
              .attr('fill', '#fff')
              .text(function(d) { return d.data.value > 0 ? d.data.label : ''; });
          };
        }
      };
    }]);
}());
