$(document).ready(function(){
    $('.sidenav').sidenav();
  });

$(document).ready(function(){
  $( "#header" ).load( "./common/header.html" );
  $( "#footer" ).load( "./common/footer.html" );
  $( "#header_painel" ).load( "./common/header_painel.html" );

});


//------------------------
function mesLiteral(nMes)
{
  aMeses = new Array('janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro');
  return aMeses[nMes-1];
}

// apura o número de dias úteis entre duas datas
function diasUteis( dataInicio , dataFim )
{

  var diffDays = Math.ceil((Math.abs(dataFim - dataInicio)) / (1000 * 3600 * 24));

  var data = new Date( dataInicio ) ;

  data.setDate(data.getDate() + 1) ;

  var ndiasUteis = 1 ;

  for (var i = 0; i < diffDays ; i++)
  {
    if ( data.getDay() != 0 && data.getDay() != 6 )
    {
      ndiasUteis += 1;
    }

    data.setDate(data.getDate() + 1) ;
  }

  if( dataInicio == dataFim )
  {
    ndiasUteis = 1;
  }

  return ndiasUteis;
}

function toMilliseconds(dias)
{
  return dias * 24 * 60 * 60 * 1000;
}

function diasCorridos( dataInicio , dataFim )
{

  var nDiasCorridos = 0

  for (var data = new Date( dataInicio ) ; data <= dataFim ; data.setDate(data.getDate() + 1) )
  {
    nDiasCorridos++;
  }

  nDiasCorridos--;

  return nDiasCorridos;
}




//-----------------------------------------------------
function apuraStatus( aValores , nTotalHorasEstimadas )
{
  var nPercentualGeralInformado = 0 ;
  var nPercentualGeralDecorrido = 0 ;
  var nPercentualGeral = 0 ;
  var cStatus ;
  var hoje = new Date() ;
  var dataInicio = hoje ;
  var dataFim = hoje ;
  var colorMap = {
                   azul:"#3366CC",
                   vermelho:"#FF0000",
                   verde:"#77933C",
                   amarelo:"#FFFF66",
                   cinza:"#808080",
                 };

   var colorMaplighten = {
                           azul:"#bbdefb",
                           vermelho:"#ef9a9a",
                           verde:"#c8e6c9",
                           amarelo:"#fff59d",
                           cinza:"#bdbdbd",
                         };
  var cCor1 ;
  var cCor2 ;

  for ( var i = 0 ; i < aValores.length ; i++)
  {
    if(aValores[i][3] < hoje )
    {
      nPercentualGeralInformado += ( aValores[i][1] * ( aValores[i][0] / nTotalHorasEstimadas * 100 ) / 100 ) ;
      nPercentualGeralDecorrido += ( aValores[i][2] * ( aValores[i][0] / nTotalHorasEstimadas * 100 ) / 100 ) ;
    }

    if( aValores[i][3] < dataInicio )
    {
      dataInicio = aValores[i][3] ;

    }

    if( aValores[i][4] > dataFim )
    {
      dataFim = aValores[i][4] ;
    }

  }

  if( nPercentualGeralInformado >= 100 )
  {
    cStatus = "concluído" ;
    cCor1 = colorMap["verde"] ;
    cCor2 = colorMaplighten["verde"] ;
  }
  else
  {
    if( dataInicio > hoje )
    {
      cStatus = "não iniciado" ;
      cCor1 = colorMap["cinza"] ;
      cCor2 = colorMaplighten["cinza"] ;
    }
    else
    {
      if( nPercentualGeralInformado >= nPercentualGeralDecorrido )
      {
        cStatus = "no prazo" ;
        cCor1 = colorMap["azul"] ;
        cCor2 = colorMaplighten["azul"] ;
      }
      else if( nPercentualGeralInformado < nPercentualGeralDecorrido )
      {
        cStatus = "atrasado" ;
        cCor1 = colorMap["vermelho"] ;
        cCor2 = colorMaplighten["vermelho"] ;
      }
    }

  }

  if( isNaN(nPercentualGeralInformado) )
  {
    cStatus = "não planejado" ;
    cCor1 = colorMap["amarelo"] ;
    cCor2 = colorMaplighten["amarelo"] ;
  }

  var aRetorno = { percinf:nPercentualGeralInformado , percdec:nPercentualGeralDecorrido , status:cStatus , cor1:cCor1 , cor2:cCor2 } ;

  return aRetorno ;

}

// -----------------------------------------------------------------
// retorna um objeto contendo o endereço da planilha e o nome da aba
function getPlanilha(cEntidade)
{

  var aPlanilhas = { garagem:"https://docs.google.com/spreadsheets/d/1UckmXVM3efAoLlRSkgKDo24kjvoVp42dcPnRygSywcQ/edit?usp=sharing",
                     projetos:"https://docs.google.com/spreadsheets/d/1oMbvtTSWIbpA3M0MVQUmwQBTZtZCa3EhBcE7kkZcEas/edit?usp=sharing",
                     orcamento_2018:"https://docs.google.com/spreadsheets/d/1gANpFH6a7M9Jg1kPHnoZN3utB7vvJSasx_obCVPtdVg/edit?usp=sharing",
                     orcamento_2019:"https://docs.google.com/spreadsheets/d/1SoOJUKxtbqCGwMYEtpzb5358Oqqz1zGgdhvwGdSY1ug/edit?usp=sharing",
                     sustentacao:"https://docs.google.com/spreadsheets/d/1hns5gkSYsrQamvIccKsZC2jT34gjSrnykEgax1prgYA/edit?usp=sharing",
                     auditoria:"https://docs.google.com/spreadsheets/d/1wO3ruQPx7UjDn7UvHLlX5GyBiti6APcp8W0EiPpl-yE/edit?usp=sharing",
                   };

  var aAbas = [
                [ "orcamentorealizado_2018" ,
                  aPlanilhas.orcamento_2018 ,
                  "&sheet=realizado"
                ],
                [ "comparativo_2018" ,
                  aPlanilhas.orcamento_2018 ,
                  "&sheet=comparativo"
                ],
                [ "investimentos_2018" ,
                  aPlanilhas.orcamento_2018 ,
                  "&sheet=investimentos"
                ],
                [ "lanc_comprometido_2018" ,
                  aPlanilhas.orcamento_2018 ,
                  "&sheet=lanc_comprometido"
                ],
                [ "total_mensal_contas_2018" ,
                  aPlanilhas.orcamento_2018 ,
                  "&sheet=total_mensal_contas"
                ],
                [ "orcamentorealizado_2019" ,
                  aPlanilhas.orcamento_2019 ,
                  "&sheet=realizado"
                ],
                [ "comparativo_2019" ,
                  aPlanilhas.orcamento_2019 ,
                  "&sheet=comparativo"
                ],
                [ "investimentos_2019" ,
                  aPlanilhas.orcamento_2019 ,
                  "&sheet=investimentos"
                ],
                [ "lanc_comprometido_2019" ,
                  aPlanilhas.orcamento_2019 ,
                  "&sheet=lanc_comprometido"
                ],
                [ "total_mensal_contas_2019" ,
                  aPlanilhas.orcamento_2019 ,
                  "&sheet=total_mensal_contas"
                ],
                [ "projetos" ,
                  aPlanilhas.projetos ,
                  "&sheet=projetos"
                ],
                [ "calendario" ,
                  aPlanilhas.projetos ,
                  "&sheet=calendario"
                ],
                [ "historico" ,
                  aPlanilhas.projetos ,
                  "&sheet=historico"
                ],
                [ "dados_topesk" ,
                  aPlanilhas.sustentacao ,
                  "&sheet=dados_topesk"
                ],
                [ "pwc" ,
                  aPlanilhas.auditoria ,
                  "&sheet=pwc"
                ],
                [ "bdo" ,
                  aPlanilhas.auditoria ,
                  "&sheet=bdo"
                ],
                [ "plano" ,
                  aPlanilhas.auditoria ,
                  "&sheet=plano"
                ],
                [ "situacao" ,
                  aPlanilhas.auditoria ,
                  "&sheet=situacao"
                ],
                [ "dados" ,
                  aPlanilhas.garagem,
                  "&sheet=dados"
                ],
                [ "projetosorc" ,
                  aPlanilhas.projetos,
                  "&sheet=orçamento"
                ]
              ]

  var aRetorno = [] ;

  for ( var i = 0 ; i < aAbas.length ; i++)
  {
    if( aAbas[i][0] == cEntidade )
    {
      aRetorno = { arquivo:aAbas[i][1] , aba:aAbas[i][2] } ;
      break;
    }
  }

  return aRetorno;
}

// -----------------------------------------------------------------
// retorna uma string contendo uma cor de acordo com o valor passado
function getColorValor(nValor)
{
  var cCor;


  if( nValor > 0 )
  {
    cCor = "green accent-3";
  }

  if( nValor < 0 )
  {
    cCor = "red";
  }

  if( nValor == 0 )
  {
    cCor = "yellow";
  }

  return cCor ;
}


//------------------------------------------------------------------------------------------------
// retorna um array contendo os elementos passados em aColunas + n zeros ( definido por nColunas )
function adicionaColunas(aColunas,nColunas)
{

  var aArrayRetorno = [] ;

  for( k = 0 ; k < aColunas.length ; k++ )
  {
    aArrayRetorno.push(aColunas[k]);
  }

  for( i = 1 ; i <= nColunas ; i++ )
  {
    aArrayRetorno.push( 0 ) ;
  }

  return aArrayRetorno ;

}

//----------------------
function getMes( cMes )
{

  var aMeses = new Array('jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez');
  var nMes;

  for (var i = 0 ; i < aMeses.length ; i++ )
  {

    if( aMeses[i] == cMes )
    {
      nMes = i+1 ;
    }

  }

  return nMes;
}


//------------------------------------------------------
function preenche_espacos( cString , tamanho , posicao )
{

  var nova_string;

  var string_complemento = " " ;

  for( i = 0 ; i < (tamanho - cString.length) ; i++ )
  {
    string_complemento += " " ;
  }

  if(posicao == "right" || posicao == null)
  {
    nova_string = cString + string_complemento ;
  }
  else
  {
    nova_string = string_complemento + cString  ;
  }

  return nova_string ;
}

//------------------------------------------------
// retorna a posíção de xElemento na array aMatriz
// atende array de arrays
function getPosicaoElemento( aMatriz , xElemento )
{

  var retorno = null ;

  for( var i = 0 ; i < aMatriz.length ; i++ )
  {
    if( aMatriz[i][0] == xElemento )
    {
      retorno = i ;
    }

   }

   return retorno ;

}


//-------------------------------------------------------------------------------------------------------------------------
// cAnoMes: anomes (no formato "AAAAMM") inicial
// nQuantidade pode ser um número positivo ou negativo. E o número meses que se deseja somar ou subtrair.
function getAnoMes( cAnoMes , nQuantidade )
{

  var cAnoMesNovo = cAnoMes ;
  var nAno = cAnoMes.substring(0, 4) ;
  var nMes = cAnoMes.substring(4, 6) ;

  for( var i = 1 ; i < Math.abs( nQuantidade ) ; i++ )
  {

    if( nQuantidade > 0 )
    {
      nMes++ ;
    }
    else
    {
      nMes--;
    }

    if(nMes == 13)
    {
      nAno++ ;
      nMes = 1 ;
    }
    else if (nMes == 0)
    {
      nAno--;
      nMes = 12;
    }

  }

  cAnoMesNovo = nAno.toString() + ("0" + (nMes)).slice(-2);

  return cAnoMesNovo ;
}

//-------------------------------------------------------------------------------------------------------------------------
// cValorOriginal : valor a ser mascarado
// cTipo pode ser : "C" texto.
function getMascara( cValorOriginal , cTipo )
{

  var nTamanho = cValorOriginal.length ;
  var cMasc = "*";
  var cRetorno = cValorOriginal.substring(0,1) + cMasc.repeat(nTamanho-2) + cValorOriginal.substring(nTamanho-1,nTamanho)

  return cRetorno  ;

}
