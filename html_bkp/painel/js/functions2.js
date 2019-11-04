    google.charts.load('current', {'packages':['corechart','gantt']});

    var variaveis=location.search.split("?");
    var classific = variaveis[1].split("=");
    var filtro_projetos =  'S="' + classific[1]+'"';

    if ( classific[1] == 'full' )
    {
      filtro_projetos =  'E<>""';
    }

    if( classific[1] != 'full' && classific[1] != 'estrategico' )
    {
      filtro_projetos =  'E = "' + classific[1] + '"'
    }

    var aProjetosPlanejados = [];
    var aProjetosGeral = [];

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChartGantt);
    google.charts.setOnLoadCallback(drawChartPrevisaoEntrega);
    google.charts.setOnLoadCallback(drawChartProjetosFase);
    google.charts.setOnLoadCallback(drawChartOrigemDepartamental);
    google.charts.setOnLoadCallback(drawCharStatusProjetos);
    google.charts.setOnLoadCallback(drawChartStatusPrazo);
    google.charts.setOnLoadCallback(drawChartOrigemProjetos);
    google.charts.setOnLoadCallback(drawChartPlanejados);


    // -----------------------------------------------------------------------
    // busca o id_projeto na matriz aProjetos, retornando a posição na matriz
    function buscaProjeto(id_projeto)
    {

      var encontrou = "N";

      for (var i = 0; i < aProjetosPlanejados.length; i++)
      {
        if( aProjetosPlanejados[i][0] == id_projeto )
        {
           var nPosicaoArrayProjeto = i;
           encontrou = "S";
        }
       }

       if( encontrou == "N" )
       {
         var nPosicaoArrayProjeto = null;
       }

       return nPosicaoArrayProjeto;

    }

    // --------------------------------------------------------------------
    // constrói o gráfico de gantt com os projetos que possuam planejamento
    function drawChartGantt()
    {

      var aEntidade1 = getPlanilha( "calendario" ) ;

      if( aEntidade1.length == 0 )
      {
        alert("Entidade 'realizado' não localizada!") ;
        return false;
      }

      var query1 = new google.visualization.Query( aEntidade1["arquivo"] + aEntidade1["aba"] );

      var txtquery1 = 'SELECT B,C,MIN(J),MAX(K),"S",MIN(I) WHERE NOT(E LIKE "X_%") AND J IS NOT NULL GROUP BY B,C' ; // projetos / calendario

      query1.setQuery( txtquery1 );

      query1.send(handleQueryResponseProjetosPlanejados);


      var aEntidade2 = getPlanilha( "projetos" ) ;

      if( aEntidade2.length == 0 )
      {
        alert("Entidade 'realizado' não localizada!") ;
        return false;
      }

      var query2 = new google.visualization.Query( aEntidade2["arquivo"] + aEntidade2["aba"] );
      var txtquery2 = 'SELECT B,C,E,F,AB,G,H,K WHERE ' + filtro_projetos  ; // projetos / projetos
      query2.setQuery( txtquery2 );
      query2.send(handleQueryResponseProjetosGeral);

      var aEntidade = getPlanilha( "projetos" ) ;

      if( aEntidade.length == 0 )
      {
        alert("Entidade 'realizado' não localizada!") ;
        return false;
      }

      var query = new google.visualization.Query( aEntidade["arquivo"] + aEntidade["aba"] );

      var txtquery = 'SELECT C,B WHERE ' + filtro_projetos ; // projetos / projetos
      query.setQuery( txtquery );
      query.send(handleQueryResponse1);

    }

    function handleQueryResponseProjetosGeral(response)
    {
      aProjetosGeral = [] ;

      if (response.isError())
        {
          alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
          return;
        }

        var otherData2 = response.getDataTable();
        var dtInicio = null;
        var dtFim = null;
        var nConclusao = 0;

        for (var i = 0; i < otherData2.getNumberOfRows(); i++)
        {
          var nPos = buscaProjeto(otherData2.getValue(i, 0));
          if( nPos != null )
          {
            dtInicio = aProjetosPlanejados[nPos][2];
            dtFim = aProjetosPlanejados[nPos][3];
            nConclusao = aProjetosPlanejados[nPos][4];
          }
          else
          {
            dtInicio = null;
            dtFim = null;
            nConclusao = 0;
          }
          aProjetosGeral.push( new Array(otherData2.getValue(i, 0),otherData2.getValue(i, 1),otherData2.getValue(i, 2),otherData2.getValue(i, 3),otherData2.getValue(i, 4),otherData2.getValue(i, 5),otherData2.getValue(i, 6),otherData2.getValue(i,7),dtInicio,dtFim,nConclusao));
        }

    }

    function handleQueryResponseProjetosPlanejados(response)
    {
      aProjetosPlanejados = [];

      if (response.isError())
        {
          alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
          return;
        }

        var otherData2 = response.getDataTable();

        for (var i = 0; i < otherData2.getNumberOfRows(); i++)
        {
          aProjetosPlanejados.push( new Array(otherData2.getValue(i, 0),otherData2.getValue(i, 1),otherData2.getValue(i, 2),otherData2.getValue(i, 3),otherData2.getValue(i, 5)));
        }

    }


    function handleQueryResponse1(response)
    {

      var hoje = new Date();
      var tam_height = 0;

      if (response.isError())
      {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
      }

      var otherData = response.getDataTable();

      var ganttData = new google.visualization.DataTable({cols: [
      {type: 'string', label: 'Task Id'},
      {type: 'string', label: 'Task Name'},
      {type: 'date', label: 'Start'},
      {type: 'date', label: 'End'},
      {type: 'number', label: 'Duration'},
      {type: 'number', label: '% Complete'},
      {type: 'string', label: 'Dependencies'},
      {type: 'number',label: 'id_projeto'}
      ]});

      for (var i = 0; i < aProjetosGeral.length; i++)
      {

        if( aProjetosGeral[i][8] != null && aProjetosGeral[i][10] < 100 && aProjetosGeral[i][5] != "cancelado" && aProjetosGeral[i][5] != "suspenso")
        {
          tam_height+=24;
          dataInicio = aProjetosGeral[i][8];
          dataFim = aProjetosGeral[i][9];
          duracao_projetos = (dataFim - dataInicio);
          tempo_decorrido = ( hoje - dataInicio );
          percentual = tempo_decorrido  / duracao_projetos *100;

          ganttData.addRow([
                              "proj_"+aProjetosGeral[i][0],
                              aProjetosGeral[i][1],
                              dataInicio,
                              dataFim,
                              null,
                              parseFloat(percentual.toFixed(2)),
                              null,
                              aProjetosGeral[i][0]
          ]);
        }

      }

      if( tam_height < 120 )
      {
        tam_height = 120;
      }

      var options = {

                       height: tam_height,
                       width: 700,
                       chartArea: {  width: "30%", height: "50%" },
                       gantt: { defaultStartDate: new Date(2018, 1, 2),
                                trackHeight: 20,
                                barHeight: 10,
                                labelStyle: {  fontSize: 12,fontName: 'Arial',color: '#000000'},
                                percentEnabled: 'True',
                                legend: { maxLines: 1, textStyle: {fontSize: 8}},

                       },
      };

      var chart = new google.visualization.Gantt(document.getElementById('chartGantt'));

      function selectHandler()
      {

         var selectedItem = chart.getSelection()[0];

         if (selectedItem) {

           var var_id_projeto = ganttData.getValue(selectedItem.row, 7);

           var link= 'proj_ficha.html?id_projeto='+var_id_projeto;

           location.href = link;
        }
      }

      google.visualization.events.addListener(chart, 'select', selectHandler);

      chart.draw(ganttData, options);

      document.getElementById("proj_concluidos").innerHTML = "<B>Projetos Concluídos</B> <br /> ";

      document.getElementById("proj_nao_planejados").innerHTML = "<B>Projetos Não Planejados</B> <br /> ";

      for (var i = 0; i < aProjetosGeral.length ; i++)
      {
        if( aProjetosGeral[i][8] == null || aProjetosGeral[i][5] == "cancelado" || aProjetosGeral[i][5] == "suspenso")
        {
          var cStatusx = " ";

          if(aProjetosGeral[i][5] == "cancelado" || aProjetosGeral[i][5] == "suspenso")
          {
            var cStatusx = " (" + "<font color='red'>" + aProjetosGeral[i][5] + "</font>" + ")" ;
          }

          var cLink= '<a href="proj_ficha.html?id_projeto='+aProjetosGeral[i][0]+'">' + aProjetosGeral[i][1] + cStatusx + '</a>';
          document.getElementById("proj_nao_planejados").innerHTML += cLink + "<br /> ";
        }
        else
        {
          if( aProjetosGeral[i][10] >= 100 )
          {
            var cLink= '<a href="proj_ficha.html?id_projeto='+aProjetosGeral[i][0]+'">'+aProjetosGeral[i][1]+'</a>';
            document.getElementById("proj_concluidos").innerHTML += cLink + "<br /> ";
          }
        }
      }
    }

    // -------------------------------------------------
    // monta o gráfico de colunas "Previsão de Entregas"
    function drawChartPrevisaoEntrega()
    {

      var aEntidade = getPlanilha( "projetos" ) ;

      if( aEntidade.length == 0 )
      {
        alert("Entidade 'realizado' não localizada!") ;
        return false;
      }

      var query = new google.visualization.Query( aEntidade["arquivo"] + aEntidade["aba"] );

      var stringquery = 'SELECT J,COUNT(J) WHERE J<>"" AND ' + filtro_projetos +' GROUP BY J ORDER BY J DESC ' ; // projetos / projetos

      query.setQuery(stringquery);
      query.send(handleQueryResponse2);
    }

    function handleQueryResponse2(response,titulo)
    {
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
      }

      var data = response.getDataTable();

      var aPrevisaoEntregas = new Array();

      var ano_mes_projeto;

      for (var i = 0; i < aProjetosGeral.length; i++)
      {

        if( aProjetosGeral[i][9] != null )
        {
          ano_mes_projeto =   aProjetosGeral[i][9].getFullYear() + "_" + ( ( 100 + aProjetosGeral[i][9].getMonth()+1).toString() ).substring(1,3);

          var nPos = 0;
          var nQtde = 1;
          var encontrou = 'N';

          for(var y=0; y<aPrevisaoEntregas.length; y++)
          {
            if(  aPrevisaoEntregas[y][0] == ano_mes_projeto )
            {
              nPos = y ;
              nQtde = aPrevisaoEntregas[y][1];
              encontrou = 'S';
            }
          }
          if( encontrou == 'N' )
          {
            aPrevisaoEntregas.push(new Array(ano_mes_projeto,nQtde));
          }
          else
          {
            aPrevisaoEntregas[nPos][1] += 1;
          }
        }
      }

      var previsaoData = new google.visualization.DataTable();

      previsaoData.addColumn('string', 'ano_mês');
      previsaoData.addColumn('number', 'quantidade');


      for (var i = 0; i < aPrevisaoEntregas.length; i++)
      {
        previsaoData.addRows( [ [ aPrevisaoEntregas[i][0] , aPrevisaoEntregas[i][1] ] ] );
      }

      var view = new google.visualization.DataView(previsaoData);

      view.setRows(previsaoData.getSortedRows({column: 0, desc: true}));

      view.setColumns( [ 0, 1,{
                              calc: 'stringify',
                              sourceColumn: 1,
                              type: 'string',
                              role: 'annotation'
                             } ] );

      var options = {
                      title: 'Previsão de Entregas',
                      titleTextStyle: { fontSize:16 },//color: <string>,  fontName: <string>,  fontSize: <number>,  bold: <boolean>,  italic: <boolean> },
                      vAxis: {gridlines: {   color: 'transparent' },textPosition: 'none'},
                      width: 500, height: 500,
                      bar: {groupWidth: "75%"},
                      legend: { position: "none" },
                      hAxis: {  direction:-1,
                                slantedText:true,
                                slantedTextAngle:90},
                      annotations: { alwaysOutside: false },
                        chartArea:{left:0}


                    };

      var chart = new google.visualization.ColumnChart(document.getElementById('chart_div_PrevisaoEntrega'));
      chart.draw(view, options);
     }

    // ----------------------------------------------------------------
    // monta o gráfico de colunas "Distribuição dos Projetos por Fase"
    function drawChartProjetosFase()
    {

      var aEntidade = getPlanilha( "projetos" ) ;

      if( aEntidade.length == 0 )
      {
        alert("Entidade 'realizado' não localizada!") ;
        return false;
      }

      var query = new google.visualization.Query( aEntidade["arquivo"] + aEntidade["aba"] );
      var stringquery = 'SELECT F,COUNT(F) WHERE F<>"" AND ' + filtro_projetos + ' AND J >= "201801" GROUP BY F ORDER BY COUNT(F) DESC';
      query.setQuery(stringquery);
      query.send(handleQueryResponse3);
    }

    function handleQueryResponse3(response)
    {
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
      }

      var data = response.getDataTable();

      var view = new google.visualization.DataView(data);

      view.setColumns( [ 0, 1,{
                              calc: 'stringify',
                              sourceColumn: 1,
                              type: 'string',
                              role: 'annotation'
                             } ] );

      var options = {
                      title: 'Distribuição por Fase',
                      titleTextStyle: { fontSize:16 },//color: <string>,  fontName: <string>,  fontSize: <number>,  bold: <boolean>,  italic: <boolean> },
                      vAxis: {gridlines: {   color: 'transparent' },textPosition: 'none',
                             },
                      width: 500, height: 500,
                      bar: {groupWidth: "75%"},
                      legend: { position: "none" },
                      hAxis: {
                                direction:-1,
                                slantedText:true,
                                slantedTextAngle:90},
                      annotations: { alwaysOutside: false },
                      chartArea:{left:0}

                    };

      var chart = new google.visualization.ColumnChart(document.getElementById('chart_div_ProjetosFase'));
      chart.draw(view, options);
    }

    // -------------------------------------------------------------
    // monta o gráfico de barras "Origem Departamental dos Projetos"
    function drawChartOrigemDepartamental()
    {

      var aEntidade = getPlanilha( "projetos" ) ;

      if( aEntidade.length == 0 )
      {
        alert("Entidade 'realizado' não localizada!") ;
        return false;
      }

      var query = new google.visualization.Query( aEntidade["arquivo"] + aEntidade["aba"] );
      var stringquery = 'SELECT E,COUNT(E) WHERE E<>"" AND ' + filtro_projetos +' GROUP BY E ORDER BY COUNT(E) DESC' ; // projetos / projetos

      query.setQuery(stringquery);
      query.send(handleQueryResponse4);
    }

    function handleQueryResponse4(response)
    {
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
      }

      var data = response.getDataTable();

      var view = new google.visualization.DataView(data);

      view.setColumns( [ 0, 1,{
                              calc: 'stringify',
                              sourceColumn: 1,
                              type: 'string',
                              role: 'annotation'
                             } ] );

      var options = {
                      title: 'Origem Departamental dos Projetos',
                      titleTextStyle: { fontSize:16 },
                      hAxis: {gridlines: {   color: 'transparent' },textPosition: 'none'},
                      width: 400,
                      height:400,
                      bar: {groupWidth: "75%"},
                      legend: { position: "left",textStyle: {fontSize: 14} },
                      annotations: { alwaysOutside: false }

                    };

      var chart = new google.visualization.BarChart(document.getElementById('chart_div_OrigemDepartamental'));

      chart.draw(view, options);
    }

    // ------------------------------------------------
    // monta o gráfico de Pizza "Status dos Projetos"
    function drawCharStatusProjetos()
    {

      var aEntidade = getPlanilha( "projetos" ) ;

      if( aEntidade.length == 0 )
      {
        alert("Entidade 'realizado' não localizada!") ;
        return false;
      }

      var query = new google.visualization.Query( aEntidade["arquivo"] + aEntidade["aba"] );

      var stringquery = 'SELECT G,COUNT(G) WHERE G<>"" AND ' + filtro_projetos +' GROUP BY G ORDER BY COUNT(G) DESC' ; // projetos / projetos

      query.setQuery(stringquery);
      query.send(handleQueryResponse5);
    }

    function handleQueryResponse5(response)
    {
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
      }

      var data = response.getDataTable();
      var chart = new google.visualization.PieChart(document.getElementById('chart_div_StatusProjetos'));
      var options = {
                      title: 'Status dos Projetos',
                      titleTextStyle: { fontSize:16 },
                     sliceVisibilityThreshold: 0,
                      pieHole: 0.4,
                      width: 500, height: 500,
                      bar: {groupWidth: "95%"},
                      legend: { position: "top",textStyle: {fontSize: 14},alignment: 'start',maxLines: 2 },
                      colors: [ '#073763','#6aa84f','#ffe599','#66cd31','#3366cc','#0099c6' ],
                      pieSliceTextStyle: { color: 'white',fontSize: 10 },
                      chartArea:{left:0}

                    };

      chart.draw(data, options);

    }

    // ----------------------------------------------
    // gráfico projetos planejados x não planejados
    function drawChartPlanejados()
    {
      var aEntidade = getPlanilha( "projetos" ) ;

      if( aEntidade.length == 0 )
      {
        alert("Entidade 'realizado' não localizada!") ;
        return false;
      }

      var query = new google.visualization.Query( aEntidade["arquivo"] + aEntidade["aba"] );

      var stringquery = 'SELECT F,COUNT(F) WHERE F<>"" AND ' + filtro_projetos +' GROUP BY F ORDER BY F DESC ' ; // projetos / projetos

      query.setQuery(stringquery);
      query.send(handleQueryResponsex);
    }

    function handleQueryResponsex(response)
    {
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
      }

      var data = new google.visualization.DataTable();
      var nPlanejados = 0 ;
      var nNaoPlanejados = 0;
      var nConcluidos = 0;

      for( var i = 0 ; i < aProjetosGeral.length ; i++)
      {

        if( aProjetosGeral[i][8] != null )
        {
          if( aProjetosGeral[i][10] >= 100 )
          {
            nConcluidos++;
          }
          else if ( aProjetosGeral[i][10] < 100 )
          {
            nPlanejados++;
          }
        }
        else
        {
          nNaoPlanejados++;
        }

      }


      data.addColumn('string', 'situaçao');
      data.addColumn('number', 'quantidade');

      data.addRow( ['não planejados', nNaoPlanejados] );
      data.addRow( ['planejados'    , nPlanejados]    );
      data.addRow( ['concluídos'    , nConcluidos]    );


      var options = {
                      title: 'Planejados x Não Planejados',
                      titleTextStyle: { fontSize:16 },
                      sliceVisibilityThreshold: 0,
                      pieHole: 0.4,
                      width: 500, height: 500,
                      bar: {groupWidth: "95%"},
                      legend: { position: "bottom",textStyle: {fontSize: 14} },
                      colors: [ '#073763','#6aa84f','#ffe599','#66cd31','#3366cc','#0099c6' ],
                      pieSliceTextStyle: { color: 'white',fontSize: 10 },
                      chartArea:{left:0}

                    };

      var chart = new google.visualization.PieChart(document.getElementById('div_Planejados'));
      chart.draw(data, options);

    }

    // ------------------------------------------------
    // monta o gráfico de Pizza "Status de Prazo"
    function drawChartStatusPrazo()
    {
      var aEntidade = getPlanilha( "projetos" ) ;

      if( aEntidade.length == 0 )
      {
        alert("Entidade 'realizado' não localizada!") ;
        return false;
      }

      var query = new google.visualization.Query( aEntidade["arquivo"] + aEntidade["aba"] );
      var stringquery = 'SELECT AB,COUNT(AB) WHERE AB<>"" AND ' + filtro_projetos + ' GROUP BY AB ORDER BY COUNT(AB) DESC' ; // projetos / projetos
      query.setQuery(stringquery);
      query.send(handleQueryResponse6);
    }

    function handleQueryResponse6(response)
    {
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
      }

      var data = response.getDataTable();
      var chart = new google.visualization.PieChart(document.getElementById('chart_div_StatusPrazo'));
      var options = {
                      title: 'Status de Prazo',
                      titleTextStyle: { fontSize:16 },//color: <string>,  fontName: <string>,  fontSize: <number>,  bold: <boolean>,  italic: <boolean> },

                      pieHole: 0.4,
                      width: 500, height: 500,
                      bar: {groupWidth: "95%"},
                      legend: { position: "bottom",textStyle: {fontSize: 14},alignment: 'center',maxLines: 2 },
                      pieSliceTextStyle: { color: 'white',fontSize: 10 },
                      sliceVisibilityThreshold: 0,
                      colors: [ '#073763','#6aa84f','#ffe599','#66cd31','#3366cc','#0099c6' ],
                      chartArea:{left:0}

                   };

      chart.draw(data, options);
    }

    // ------------------------------------------------
    // monta o gráfico de Pizza "Origem dos Projetos"
    function drawChartOrigemProjetos()
    {

      var aEntidade = getPlanilha( "projetos" ) ;

      if( aEntidade.length == 0 )
      {
        alert("Entidade 'realizado' não localizada!") ;
        return false;
      }

      var query = new google.visualization.Query( aEntidade["arquivo"] + aEntidade["aba"] );
      var stringquery = 'SELECT H,COUNT(H) WHERE C<>""  AND ' + filtro_projetos +' GROUP BY H ORDER BY COUNT(H) DESC' ; // projetos / projetos
      query.setQuery(stringquery);
      query.send(handleQueryResponse7);
    }

    function handleQueryResponse7(response)
    {
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
      }

      var data = response.getDataTable();
      var chart = new google.visualization.PieChart(document.getElementById('chart_div_OrigemProjetos'));
      var options = {
                      title: 'Origem dos Projetos',
                      titleTextStyle: { fontSize:16 },//color: <string>,  fontName: <string>,  fontSize: <number>,  bold: <boolean>,  italic: <boolean> },
                      pieHole: 0.4,
                      width: 500, height: 500,
                      bar: {groupWidth: "95%"},
                      legend: { position: "bottom",textStyle: {fontSize: 14} },
                      colors: [ '#073763','#6aa84f','#ffe599','#66cd31','#3366cc','#0099c6' ],
                      pieSliceTextStyle: { color: 'white',fontSize: 12 },
                      sliceVisibilityThreshold: 0,
                      chartArea:{left:0}
                    };

      chart.draw(data, options);
    }

