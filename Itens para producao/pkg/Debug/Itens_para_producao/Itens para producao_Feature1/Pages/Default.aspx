<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <SharePoint:ScriptLink name="sp.js" runat="server" OnDemand="true" LoadAfterUI="true" Localizable="false" />
    <SharePoint:ScriptLink name="datepicker.js" runat="server" LoadAfterUI="true" Localizable="false" ></SharePoint:ScriptLink>    
    <meta name="WebPartPageExpansion" content="full" />

    <!-- Add your CSS styles to the following file -->
    <link rel="Stylesheet" type="text/css" href="../Content/App.css" />

    <!-- Add your JavaScript to the following file -->
    <script type="text/javascript" src="../Scripts/App.js"></script>    
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Saída de itens do ESTOQUE para PRODUÇÃO
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <div>
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
                    <div>
                        <p id="briefingError" style="margin-top:-6px;color:red;display:none">*Por favor confirme o evento</p>
                    </div>
                </div>
                <div class="flex-item" id="dta">
                    <div>
                        <h2>Data de saída</h2>
                    </div>
                    <div class="center-flex">                        
                        <input id="myDateField_1" type="text" field-type="DateTime" onchange="compareDatas(this)" />                  
                    </div>
                    <div>
                        <p id="dtaError" style="margin-top:-6px;color:red;display:none">*Favor informar uma data</p>
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
                <p style="color:red;">*Produtos com quantidade zero serão exluídos!</p>
			    <table id="tablePrint"></table>
			    <button style="margin-top:10px;" id="finalizarPedido" type="button" onclick="addPedidoOnSaidaEstoque()">Finalizar pedido</button>	
                <button id="changeEvent" style="margin-top:10px;" type="button" onclick="novoEvento()">Escolher novo evento</button>
		    </div>
        </div>
        <div  class="side-bar">
            <!--<p id="qtdEstoque" align="center"></p>-->
            <img id="imgPreview" src="https://rosalvoponte.sharepoint.com/sites/sgs/sge/Catlogo%20de%20Produtos/Produto%20sem%20imagem.jpg"  alt="Preview"/>
        </div>
        <!--<div id="myDiv1" align="center"></div>
        <div id="myDiv3" align="center"></div>
        <div id="myDiv2" align="center"></div>
        <p onclick="retrieveAllListProperties()">Mostar listas</p>
        <p onclick="retrieveListItems()">Mostar Itens</p>
        <p onclick="retrieveFieldsOfListView()">Mostar colunas</p>
        <p onclick="createListItemTest()">Criar item</p>
        <p onclick="updateListItem()">Atualizar lista</p>
        <p onclick="deleteListItem()">deletar item</p>
        <p onclick="myFunction()">ver carrinho</p>-->
    </div>
</asp:Content>
