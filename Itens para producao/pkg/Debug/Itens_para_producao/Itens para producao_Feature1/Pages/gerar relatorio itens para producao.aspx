<%@ Page language="C#" Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register Tagprefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<WebPartPages:AllowFraming ID="AllowFraming" runat="server" />

<html>
<head>
    <title></title>

    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>   
    <SharePoint:ScriptLink Name="MicrosoftAjax.js" runat="server" Defer="False" Localizable="false"/>
    <SharePoint:ScriptLink Name="SP.core.js" runat="server" Defer="False" Localizable="false"/>
    <SharePoint:ScriptLink Name="SP.js" runat="server" Defer="True" Localizable="false"/>
    <script type="text/javascript" src="../Scripts/jspdf.js"></script>
    <script type="text/javascript" src="../Scripts/jspdf.min.js"></script>
    <script type="text/javascript" src="../Scripts/jspdf.plugin.autotable.js"></script>
    <!--<script type="text/javascript" src="../Scripts/App.js"></script>-->
    <script type="text/javascript" src="../Scripts/App1.js"></script>


    <link rel="Stylesheet" type="text/css" href="../Content/gerar relatorio itens para producao.css" />

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
    <style type="text/css">
         .ms-backgroundImage{
            background-image: none;
        }
    </style>
</head>
<body>
   <div>
        <div class="main-bar">
            <div class="flex-container">
                <div class="flex-item" id="ddlB">
                    <div>
                        <h2>Escolha um evento</h2>
                    </div>
                    <div>
                        <select id="ddlBriefing"><option disabled=""> -- Selecione um evento -- </option></select>
                        <button type="button" id="briefingChoice" onclick="choiceBriefing(this)">Visualizar pedido</button>
                        <button type="button" onclick="genPDF()">Gerar relatório</button>
                    </div>
                </div>
            </div>
            <div class="below-bar">
			    <table id="tablePrint"></table>			                 
                <table id="tablePrintB"></table>	
		    </div>
        </div>
    </div>
</body>
</html>
