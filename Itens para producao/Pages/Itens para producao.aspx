<%@ Page language="C#" Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<WebPartPages:AllowFraming ID="AllowFraming" runat="server" />
<!DOCTYPE html>
<html>
<head>
    <title></title>

    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>   
    <SharePoint:ScriptLink Name="MicrosoftAjax.js" runat="server" Defer="False" Localizable="false"/>
    <SharePoint:ScriptLink Name="SP.core.js" runat="server" Defer="False" Localizable="false"/>
    <SharePoint:ScriptLink name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink Name="SP.js" runat="server" Defer="True" Localizable="false"/>
    <SharePoint:ScriptLink name="datepicker.js" runat="server" LoadAfterUI="true" Localizable="false" ></SharePoint:ScriptLink>
    <script type="text/javascript" src="../Scripts/App.js"></script>

    
    <link rel="Stylesheet" type="text/css" href="../Content/Itens para producao.css" />

    <script type="text/javascript">
        // Defina o estilo da página de Web Part cliente para que seja consistente com o host da Web.
        (function () {
            'use strict';

            var hostUrl = '';
            var link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            if (document.URL.indexOf('?') != -1) {
                var params = document.URL.split('?')[1].split('&');
                for (var i = 0; i < params.length; i++) {
                    var p = decodeURIComponent(params[i]);
                    if (/^SPHostUrl=/i.test(p)) {
                        hostUrl = p.split('=')[1];
                        link.setAttribute('href', hostUrl + '/_layouts/15/defaultcss.ashx');
                        break;
                    }
                }
            }
            if (hostUrl == '') {
                link.setAttribute('href', '/_layouts/15/1033/styles/themable/corev15.css');
            }
            document.head.appendChild(link);
        })();
    </script>
</head>
<body>
    <div style="width:auto;height:700px">
        <div class="main-bar">
            <div class="flex-container">
                <div class="flex-item" id="ddlB">
                    <div>
                        <h2>Escolha um evento</h2>
                    </div>
                    <div>
                        <select id="ddlBriefing"><option disabled=""> -- Selecione um evento -- </option></select>
                        <button type="button" id="briefingChoice" onclick="choiceBriefing(this)">Confirmar</button>
                    </div>
                </div>
                <div class="flex-item" id="dta">
                    <div>
                        <h2>Data de saída</h2>
                    </div>
                    <div class="center-flex">                        
                        <input id="myDateField_1" type="text" field-type="DateTime" />                  
                    </div>
                    <div>
                        <p id="dtaError" style="margin-top:-6px;color:red">Você deve informar uma data</p>
                    </div>
                </div>
                <div class="flex-item" id="ddlG">
                    <div>
                        <h2>Grupo</h2>
                    </div>
                    <div class="center-flex">
                        <select id="ddlGrupo" onchange="choice(this)"><option disabled=""> -- Selecione um Grupo -- </option></select>
                    </div>
                </div>
            </div>
            <div class="flex-container">
                <div class="flex-item" id="ddlP">
                    <div>
                        <h2>Produto</h2>
                    </div>
                    <div style="margin-top:10px;">
                        <select id="ddlProduto" onchange="choiceImage(this)"><option disabled=""> -- Selecione um Grupo -- </option></select>
                    </div>
                </div>
                <div class="flex-item" id="ddlQ">
                    <div>
                        <h2>Quantidade</h2>
                    </div>
                    <div>
                        <div class="qtdB">
                            <a href="#" class="fill-div" id="diminuiAcrescimo">-</a>
                        </div>
                        <div style="float:left;margin-left:5px;margin-right:5px;margin-top:4px;">
                            <input type="text" size='1' id="txtAcrescimo" style="text-align:center;" onchange="verifyQtd(this)"/>
                        </div>
                        <div class="qtdB">
                            <a href="#" class="fill-div" id="aumentaAcrescimo">+</a>
                        </div>
                        <button id="btnAddProduto" disabled="disabled" type="button" onclick="addNewProduct()">Adicionar</button>
                    </div>
                    <div>
                        <p id="qtdEstoque" style="margin-top:-2px;color:red"></p>
                    </div>
                </div>
            </div>
            <div class="below-bar">
			    <table id="tablePrint"></table>
			    <button style="margin-top:10px;" id="finalizarPedido" type="button" onclick="addPedidoOnSaidaEstoque()">Finalizar pedido</button>	
                <button id="changeEvent" style="margin-top:10px;" type="button" onclick="novoEvento()">Escolher novo evento</button>
		    </div>
        </div>
        <div  class="side-bar">
            <!--<p id="qtdEstoque" align="center"></p>-->
            <img id="imgPreview" src=""  alt="Preview"/>
        </div>
       <!--<div id="myDiv1" align="center"></div>
        <div id="myDiv3" align="center"></div>
        <div id="myDiv2" align="center"></div>
        <p onclick="retrieveAllListProperties()">Mostar listas</p>
        <p onclick="retrieveListItems()">Mostar Itens</p>
        <p onclick="retrieveFieldsOfListView()">Mostar colunas</p>
        <p onclick="createListItemTest()">Criar item</p>
        <p onclick="myFunction()">ver carrinho</p>-->
    </div>
</body>
</html>
