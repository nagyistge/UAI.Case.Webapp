
var app = angular.module('uaicase.materias',[]);


app.factory('MateriaService', ['$http','ENV', function ($http,ENV) {

    var put = function (docente) {
        return $http.put(ENV.apiEndpoint+"/materia/", docente);

    }


    var all = function (id) {
        return $http.get(ENV.apiEndpoint+"/materia/");

    }

    var one = function (id) {
        return $http.get(ENV.apiEndpoint+"/materia/" + id);

    }



    return {
        one: one,
        put: put,
        all: all


    };

}]);
app.factory('ContenidoMateriaService', ['$http', '$rootScope','ENV',  function ($http, $rootScope,ENV) {

    var put = function (contenido) {
        return $http.put(ENV.apiEndpoint+"/contenidoMateria/", contenido);

    }


    var putContenido = function (contenido) {


        return $http.put(ENV.apiEndpoint+"/contenidoMateria/contenido/", contenido);
       }

    var putUnidad = function (unidad) {
        return $http.put(ENV.apiEndpoint+"/contenidoMateria/unidad/", unidad);

    }

    var all = function (idMateria) {
        return $http.get(ENV.apiEndpoint+"/contenidoMateria/" + idMateria);

    }

    var one = function (id) {
        return $http.get(ENV.apiEndpoint+"/curso/" + id);

    }


    return {

        one: one,
        put: put,
        all: all,
        putUnidad: putUnidad,
        putContenido: putContenido


    };

}]);
app.directive('verMateria', ['$rootScope', function ($rootScope) {


    var controller = function (CommonService,CursoService,  fileDownload, $timeout, $scope, $window, $aside, MateriaService, $rootScope) {



        $scope.user = $rootScope.user;
        $scope.cursoSelected = $rootScope.cursoSelected;
        $scope.materiaSelected = $scope.materia;
        $scope.getMateria = function () {
            CursoService.allCursosFromMateria($scope.materia.Id).then(function (response) {
                $scope.materiaCursos = response.data;

            });

        }






        $scope.getMateria();


    };








    return {
        restrict: 'EA',
        templateUrl: 'assets/uaicase/academico/materias/ver-materia.html',
        replace: true,
        controller: controller,
        scope: {
            materia: "=",




        }



    };

}]);
app.directive('mostrarContenidoMateria', ['$rootScope', function ($rootScope) {
    var controller = function (CommonService,docenteAlumnoCursoService, fileDownload, fileUpload, CommonService, ContenidoMateriaService, CursoService, $timeout, $scope, $window, $aside, AlumnoService, MateriaService, $rootScope) {


        $scope.unidades = [];
        $scope.user = $rootScope.user;
        $scope.getContenido = function () {
            ContenidoMateriaService.all($scope.materia.Id).then(function (resp) {
                $scope.contenido = resp.data;
                $scope.currentPage = 1;

                CommonService.tipoContenido().then(function (resp) {
                    $scope.tipoContenido = resp.data;
                })
            })
        }


        $scope.guardarContenido = function (contenido) {
            //contenido.editing = false;
            ContenidoMateriaService.put(contenido).then(function (resp) {
                if (!contenido.editing)
                $scope.contenido.push(contenido);
            })

            contenido.editing = false;
        }


        $scope.agregarUnidad = function (u) {
            var unidad = {};
            unidad.Identificador = "Id";
            unidad.Descripcion = "Descripción";
            if (u.Unidades == undefined)
                u.Unidades = [];

            u.Unidades.push(unidad);

            ContenidoMateriaService.putUnidad(u).then(function (resp) {

                ""
            })


        }

        $scope.saveUnidad = function (unidad) {

            unidad.editing = false;

            ContenidoMateriaService.putUnidad(unidad.Unidad).then(function (resp) {

                ""

            })
        }

        $scope.putContenido = function (contenido) {

            if (contenido == undefined) {
                var contenido = {};
                contenido.Unidad = {};
            }
            contenido.Unidad.Identificador = "Id";
            contenido.Unidad.Descripcion = "Descripción";
            contenido.Materia = $scope.materia;



            ContenidoMateriaService.put(contenido).then(function (resp) {
                $scope.contenido.push(contenido);
                ""
            })


        }

        $scope.addContenido = function (unidad, contenido) {
            if (unidad.Contenidos == undefined)
                unidad.Contenidos = [];




            unidad.Contenidos.push(contenido);
        }

        $scope.showContenido = function (unidad) {
            $scope.unidadContent = unidad;

            showForm();
        }
        var formTpl = $aside({
            scope: $scope,
            template: '/assets/uaicase/academico/materias/materia-contenido-form.html',
            show: false,
            placement: 'left',
            backdrop: true,
            animation: 'am-slide-left'
        });

        showForm = function () {

            formTpl.show();
        };

        hideForm = function () {
            formTpl.hide();
        };


        $scope.$on('$destroy', function () {
            hideForm();
        });

        $scope.fileDownload = function (file) {
            fileDownload.downloadFile(file)
        }




        $scope.postContenido = function (c) {

            fileUpload.uploadFileToUrl(c.file).then(function (resp) {
                c.model.Archivo = resp.data;
                ContenidoMateriaService.putContenido(c.model).then(function (resp2) {
                    if ($scope.unidadContent.Contenidos == undefined)
                        $scope.unidadContent.Contenidos = [];

                    $scope.unidadContent.Contenidos.push(resp2.data);
                    ContenidoMateriaService.putUnidad($scope.unidadContent).then(function (resp) {
                        ""
                    })

                });
            });



        }
        $scope.selectUnidad = function (u) {

            u.visible = !u.visible;

            if ($scope.selectedUnidad != undefined) {
                if ($scope.selectedUnidad.Id != u.Id)
                    $scope.selectedUnidad = u;
                else
                    $scope.selectedUnidad = undefined
            }
            else
                $scope.selectedUnidad = u;
        }

        $scope.selectSubUnidad = function (u) {

            u.visible = !u.visible;


            if ($scope.selectedSubUnidad != undefined) {
                if ($scope.selectedSubUnidad.Id != u.Id)
                    $scope.selectedSubUnidad = u;
                else
                    $scope.selectedSubUnidad = undefined
            }
            else
                $scope.selectedSubUnidad = u;
        }

        $scope.treeClass = function (u) {
            var ret;
            if (u.Unidades != undefined) {
                if (u.Unidades.length > 0)
                    ret = "<i class='md md-keyboard-arrow-right'></i>";
                else
                    ret = "";
            }

            if (u.Contenidos!= undefined) {
                if (u.Contenidos.length > 0)
                    ret = "<i class='md md-keyboard-arrow-right'></i>";

            }


            //            if ($scope.selectedUnidad!=undefined)
            //      if ($scope.selectedUnidad.Id == u.Id && u.Unidades.length > 0) {
            if (u.visible) {
                ret = "<i class='md md-keyboard-arrow-down'></i>";
            }

            return ret;
        }


        $scope.treeSubClass = function (u) {
            var ret;
            if (u.Contenidos != undefined) {
                if (u.Contenidos.length > 0)
                    if (u.Contenidos.length > 0)
                        ret = "<i class='md md-keyboard-arrow-right'></i>";
                    else
                        ret = "";
            }
            //if ($scope.selectedSubUnidad != undefined)
            //if ($scope.selectedSubUnidad.Id == u.Id && u.Contenidos.length > 0) {
            if (u.visible) {
                ret = "<i class='md md-keyboard-arrow-down'></i>";
            }

            return ret;
        }

        $scope.getContenido();


    };








    return {
        restrict: 'EA',
        templateUrl: 'assets/uaicase/academico/materias/mostrar-contenido-materia.html',
        replace: true,
        controller: controller,
        scope: {
            materia: "=",




        }



    };

}]);
