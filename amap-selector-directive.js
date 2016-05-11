(function () {
  'use strict';
  angular.module('cms.latlngpicker.amap', [])
    .directive('cmsLatLngPickerAmap', cmsLatLngPickerAmap);

  function cmsLatLngPickerAmap() {
    var directive = {
      restrict: 'EA',
      template: '<div id="{{vm.id}}" ng-style="{height:vm.h,width:vm.w}"></div>',
      scope: {
        mppLat: '=',
        mppLng: '=',
        mppAddr: '=',
        mppControl: '=',
        width: '@',
        height: '@'
      },
      link: linkFunc,
      controller: Controller,
      controllerAs: 'vm',
      bindToController: true
    };

    Controller.$inject = [];

    return directive;

    function Controller() {
      var vm = this;

      activate();

      function activate() {
        var id;
        id = 'map_' + (+ new Date);
        vm.id = id;
      }
    }

    function linkFunc(scope, el, attr, ctrl) {
      var map, marker, point, marker;
      var width, height;

      scope.vm.mppControl = scope.vm.mppControl || {}

			scope.vm.mppControl.search = null;

      angular.forEach({ width: 'w', height: 'h' }, function (v, k) {

        if (angular.isDefined(scope.vm[k])) {
          if (/^\d+$/.test(scope.vm[k])) {
            scope.vm[v] = scope.vm[k] + 'px';
          }
        } else {
          scope.vm[v] = '300px';
        }
      });

      setTimeout(initAMap, 200);

      function initAMap() {
				//初始化地图对象，加载地图
				var map = new AMap.Map(scope.vm.id, {
					resizeEnable: true
				});
				var marker = new AMap.Marker({
					map: map,
					icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
					position: [scope.vm.mppLng, scope.vm.mppLat],
					draggable: true
				});

				map.setFitView();

        map.on('click', updateData);
				marker.on('dragend', updateData);

				function updateData(e){
          marker.setPosition(e.lnglat);
					updateAddress(e.lnglat);
          updateLatLng(e.lnglat.lat, e.lnglat.lng);
				}

				AMap.service(["AMap.PlaceSearch"], function () {
					var placeSearch = new AMap.PlaceSearch({ //构造地点查询类
						pageSize: 5,
						pageIndex: 1,
						map: map,
						panel: "panel"
					});
					//关键字查询
					scope.vm.mppControl.search = function (v) {
						placeSearch.search(v);
					}
				});

				var geocoder;

				AMap.service(["AMap.Geocoder"], function () { //加载地理编码
					geocoder = new AMap.Geocoder({
						radius: 1000,
						extensions: "all"
					});
				});

        function updateAddress(point) {
					//步骤三：通过服务对应的方法回调服务返回结果，本例中通过逆地理编码方法getAddress回调结果
					geocoder.getAddress(point, function (status, result) {
						//根据服务请求状态处理返回结果
						if (status == 'error') {
							alert("服务请求出错啦！ ");
						}
						if (status == 'no_data') {
							alert("无数据返回，请换个关键字试试～～");
						}
						else {
							var address = result.regeocode.formattedAddress;
							scope.$apply(function () {
								scope.vm.mppAddr = address;
							});
						}
					});
        }

      }

      function updateLatLng(lat, lng) {
        scope.$apply(function () {
          scope.vm.mppLat = lat;
          scope.vm.mppLng = lng;
        })
      }
    }
  }
})();
