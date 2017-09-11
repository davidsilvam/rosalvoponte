var hostweburl = decodeURIComponent(getQueryStringParameter('SPHostUrl'));
var appweburl = decodeURIComponent(getQueryStringParameter('SPAppWebUrl'));
var carrinhoProdutosArray = new Array();
var infoProdutosArray = new Array();
var infoBriefingArray = new Array();
var dataEventoComparar = "";
var briefingSelect = 0;
var errorAddProduct = 0;
var numObs = 0;
var excluidos = 0;
var idProd = 0;

//alert(hostweburl);
//alert(appweburl);

$(document).ready(function () {
    //SP.SOD.executeFunc('sp.js', 'SP.ClientContext', ListItems);
    //SP.SOD.executeFunc('sp.js', 'SP.ClientContext', retrieveListItems);
    //SP.SOD.executeFunc('sp.js', 'SP.ClientContext', createListItem);
    //SP.SOD.executeFunc('sp.js', 'SP.ClientContext', updateListItem);
    //SP.SOD.executeFunc('sp.js', 'SP.ClientContext', deleteListItem(5));
    //SP.SOD.executeFunc('sp.js', 'SP.ClientContext', retrieveAllListProperties);
    //SP.SOD.executeFunc('sp.js', 'SP.ClientContext', ddlPopulateBriefing);
    ExecuteOrDelayUntilScriptLoaded(ddlPopulateBriefing, 'sp.js');
    initQuant();
    initializeDatePickers();
    //verifyQtd();
    //ExecuteOrDelayUntilScriptLoaded(ddlPopulateProduto, 'sp.js');

});

/*
    Get URL's'
 */
function getQueryStringParameter(paramToRetrieve) {
    var params = document.URL.split("?")[1].split("&");
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] === paramToRetrieve) return singleParam[1];
    }
}

/*
    Routine to show all lists in SharePoint site
 */
function retrieveAllListProperties() {

    var clientContext = new SP.ClientContext(appweburl);
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);
    var oWebsite = siteContext.get_web();
    this.collList = oWebsite.get_lists();

    clientContext.load(collList, 'Include(Title, Id)');

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededAllListProperties), Function.createDelegate(this, this.onQueryFailedAllListProperties));
}

function onQuerySucceededAllListProperties() {

    var listInfo = '';

    var listEnumerator = collList.getEnumerator();

    while (listEnumerator.moveNext()) {
        var oList = listEnumerator.get_current();
        //listInfo += 'Title: ' + oList.get_title() + ' Created: ' + oList.get_created().toString() + '\n';
        listInfo += 'Title: ' + oList.get_title() + ' ID: ' + oList.get_id().toString() + '<br>';
    }
    myDiv2.innerHTML = listInfo;
    //alert(listInfo);
}

function onQueryFailedAllListProperties(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*
    Routine to get list item SharePoint
*/
function retrieveListItems() {
    var clientContext = new SP.ClientContext(appweburl);//URL do host
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);//URL do webpart
    var oList = siteContext.get_web().get_lists().getByTitle('Entrada de Itens da Produção para o ESTOQUE');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Number\'>1</Value></Geq></Where></Query></View>');
    this.collListItem = oList.getItems(camlQuery);
    try {
        clientContext.load(collListItem);
    } catch (err) {
        console.log('Deu bode' + err);
    }
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));
}

function onQuerySucceeded(sender, args) {
    var listItemInfo = '';
    var listItemEnumerator = collListItem.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        //console.log(JSON.stringify(oListItem.get_item('Produto')));
        //var a = JSON.parse(JSON.stringify(oListItem.get_item('Endere_x00e7_o_x0020_da_x0020_Im'), null, 2));
        ///var a = JSON.parse(JSON.stringify(oListItem.get_item('Buffet'), null, 2));
        //console.log(Object.keys(a));
        //var h = JSON.stringify(oListItem.get_item('Endere_x00e7_o_x0020_da_x0020_Im'), null, 2);
        //listItemInfo += '\nID: ' + oListItem.get_id() + '||' + JSON.stringify(oListItem.get_item('Produto')) + '||' +oListItem.get_item('orcamento') +'<br>'; 
        //var a = JSON.stringify(oListItem.get_item('Produto_x003a_Codigo'));
        //var b = JSON.stringify(oListItem.get_item('Produto'));
        //listItemInfo += '\nID: ' + oListItem.get_id() + ' evento ' + a + ' produto: ' + b + ' quantidade: ' + oListItem.get_item('Quantidade0') + ' observacao: ' + oListItem.get_item('Title') + '<br>';
        listItemInfo += oListItem.get_item('Produto_x003a_Quantidade_x0020_e') + '<br>';
        //if (a !== 'null' && b !== 'null') {
        //    listItemInfo += '\nID: ' + oListItem.get_id() + ' evento ' + a/*JSON.parse(a)["$5O_1"]*/ + ' produto: ' + JSON.parse(b)["$5O_1"] + ' quantidade: ' + oListItem.get_item('Quantidade0') + ' observacao: ' + oListItem.get_item('Title') + 'data ' + oListItem.get_item('dtsaidaorcamento') + '<br>';          
        //}
        /*if (JSON.stringify(oListItem.get_item('Endere_x00e7_o_x0020_da_x0020_Im'), null, 2) !== 'null') {
            listItemInfo += '\nID: ' + oListItem.get_id() +
                '\nTitle: ' + JSON.stringify(oListItem.get_item('Endere_x00e7_o_x0020_da_x0020_Im'), null, 2) + JSON.parse(JSON.stringify(oListItem.get_item('Endere_x00e7_o_x0020_da_x0020_Im'), null, 2))['$1_1']+ '<br>';
        }*/
            /*'\nTipo de Evento: ' + oListItem.get_item('Tipo_x0020_de_x0020_Evento') +
            '\nVisita: ' + oListItem.get_item('Visita') +'<br>';
           +
            '\nBody: ' + oListItem.get_item('numero') + '<br>';*/
    }
    myDiv1.innerHTML = listItemInfo;
    console.log(listItemInfo);
}

function onQueryFailed(sender, args) {
    myDiv1.innerHTML = 'Request failed. ' + args.get_message() + '\n' + args.get_stackTrace();
}

/*
    Start routine to update one item in list SharePoint 
 */
function updateListItem() {
    var clientContext = new SP.ClientContext(appweburl);
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);
    var oList = siteContext.get_web().get_lists().getByTitle('Saída de Itens do ESTOQUE para PRODUÇÃO');
    this.oListItem = oList.getItemById(180);

    oListItem.set_item('Quantidade0', 7);
    oListItem.set_item('Title', 'Teste update quant e obs');

    oListItem.update();

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededUpdate), Function.createDelegate(this, this.onQueryFailedUpdate));
}

function onQuerySucceededUpdate() {
    console.log('Item updated!');
    //alert('Item updated!');
}

function onQueryFailedUpdate(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    //alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/* 
 * Rotina para deletar um item da lista
 */

function deleteListItem(lista,idItem) {

    this.itemId = idItem;

    var clientContext = new SP.ClientContext(appweburl);
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);
    var oList = siteContext.get_web().get_lists().getByTitle(lista);

    this.oListItem = oList.getItemById(itemId);

    oListItem.deleteObject();

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededDelete), Function.createDelegate(this, this.onQueryFailedDelete));
}

function onQuerySucceededDelete() {

    console.log('Item deleted: ' + itemId);
}

function onQueryFailedDelete(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*
    Routine to insert item in list SharePoint
*/

function convertDateFormat(date) {
    var day = "";
    var month = "";
    var year = "";
    var flag;
    if (date[2] === '/' && date[5] === '/') {
        flag = 0;
    }
    else if (date[1] === '/' && date[3] === '/') {
        flag = 1;
    }
    else if (date[1] === '/') {
        flag = 2;
    }
    if (flag === 0) {
        day = parseInt(date[0] + date[1]);
        month = date[3] + date[4];
        year = date[6] + date[7] + date[8] + date[9];
    }
    else if (flag === 1) {
        day = 0 + parseInt(date[0]);
        month = 0 + parseInt(date[2]);
        year = date[4] + date[5] + date[6] + date[7];
    }
    else if (flag === 2) {
        day = 0 + parseInt(date[0]);
        month = date[2] + date[3];
        year = date[5] + date[6] + date[7] + date[8];
    }
    else {
        day = parseInt(date[0] + date[1]);
        month = 0 + parseInt(date[3]);
        year = date[5] + date[6] + date[7] + date[8];
    }
    return month + '/' + day + '/' + year +' 8:00:00';
}

function createListItemTest() {
    //var valueName = document.getElementById("value2").value;
    //var numName = document.getElementById("value3").value;
    var clientContext = new SP.ClientContext(appweburl);
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);
    var lkfieldsomthing = new SP.FieldLookupValue();//Alteração
    var lkfieldsomthing2 = new SP.FieldLookupValue();//Alteração
    var oList = siteContext.get_web().get_lists().getByTitle('Saída de Itens do ESTOQUE para PRODUÇÃO');

    var itemCreateInfo = new SP.ListItemCreationInformation();
    this.oListItem = oList.addItem(itemCreateInfo);

    console.log(convertDateFormat($('#myDateField_1').val()));

    lkfieldsomthing.set_lookupId(1009);
    lkfieldsomthing2.set_lookupId(1665);

    //oListItem.set_item('dtsaidaorcamento', convertDateFormat($('#myDateField_1').val()));
    oListItem.set_item('dtsaidaorcamento', '08/12/2017 8:00:00');
//    oListItem.set_item('dtsaidaorcamento',);
    oListItem.set_item('Tipo_x0020_de_x0020_movimenta_x0', 'TESTE_4_BUG_DATA');
    oListItem.set_item('orcamento', lkfieldsomthing);
    //oListItem.set_item('orcamento').get_viewFields();
    oListItem.set_item('Produto',lkfieldsomthing2);

    oListItem.update();

    clientContext.load(oListItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededCreateTest), Function.createDelegate(this, this.onQueryFailedCreateTest));
}

function onQuerySucceededCreateTest() {
    alert('Item created: ' + oListItem.get_id());
}

function onQueryFailedCreateTest(sender, args) {

    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*
    Routine to return field to an list Sharepoint
 */
function retrieveFieldsOfListView() {
    var clientContext = new SP.ClientContext(appweburl);//URL do host
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);//URL do webpart
    var list = siteContext.get_web().get_lists().getByTitle('Entrada de Itens da Produção para o ESTOQUE');
    var defaultview = list.getView('00000000-0000-0000-0000-000000000000');
    this.listFields = defaultview.get_viewFields();
    clientContext.load(this.listFields);
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onListFieldsQuerySucceeded), Function.createDelegate(this, this.onListFieldsQueryFailed));
}

function onListFieldsQuerySucceeded(sender, args) {
    var fieldListInfo = '';
    var fieldEnumerator = listFields.getEnumerator();
    while (fieldEnumerator.moveNext()) {
        var oField = fieldEnumerator.get_current();
        fieldListInfo += oField +'<br>';
    }
    myDiv3.innerHTML = fieldListInfo;
}

function onListFieldsQueryFailed(sender,args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/* ==============================================================DEBUG/\ CODIGO \/========================================================== */
/*
    createListItem() - Adicionar um item do mestre detalhe na lista Saída de Itens do ESTOQUE para PRODUÇÃO
    Entrada: Nome da lista(String), Id do Cliente(Int), Id do Produto(Int), Quantidade do produto(Int), Observação(String)
    Saída: Parâmetros adicionados na lista
    
    onQuerySucceededCreate() - Sucesso na criação de um novo item
    Entrada: Objeto corrente
    Saída: Id do item criado

    onQueryFailedCreate(sender, args) - Falha na criação de um novo item
    Entrada: Objeto corrente
    Saída: Mensagem de erro da falha da criação de um novo item
    
 */

function createListItem(listaAdd,clienteID,produtoID,qtdProduto,dataSaida,observacao) {
    var clientContext = new SP.ClientContext(appweburl);
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);
    var lkfieldsomthing = new SP.FieldLookupValue();//Alteração
    var lkfieldsomthing2 = new SP.FieldLookupValue();//Alteração
    var oList = siteContext.get_web().get_lists().getByTitle(listaAdd);//'Saída de Itens do ESTOQUE para PRODUÇÃO'

    var itemCreateInfo = new SP.ListItemCreationInformation();
    this.oListItem = oList.addItem(itemCreateInfo);

    lkfieldsomthing.set_lookupId(clienteID);//1009
    lkfieldsomthing2.set_lookupId(produtoID);//1665
    //console.log(lkfieldsomthing.set_lookupId(clienteID), lkfieldsomthing2.set_lookupId(produtoID));
    //oListItem.set_item('dtsaidaorcamento', valueName);
    //    oListItem.set_item('dtsaidaorcamento',);
    oListItem.set_item('Title', observacao);
    oListItem.set_item('dtsaidaorcamento', dataSaida);
    oListItem.set_item('Quantidade0', qtdProduto);
    oListItem.set_item('Tipo_x0020_de_x0020_movimenta_x0', 'TESTE_5');
    oListItem.set_item('orcamento', lkfieldsomthing);
    oListItem.set_item('Produto', lkfieldsomthing2);

    oListItem.update();

    clientContext.load(oListItem);

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededCreate), Function.createDelegate(this, this.onQueryFailedCreate));
}

function onQuerySucceededCreate() {
    console.log('Item created: ' + oListItem.get_id());
}

function onQueryFailedCreate(sender, args) {
    console.log('Request Failed' + args.get_message() + '\n' + args.get_stackTrace());
    errorAddProduct = 1;
}

/*
   updateListItem(listName,id,quant,obs) - Atualiza itens de uma lista('Saída de Itens do ESTOQUE para PRODUÇÃO')
    Entrada: Nome da lista(string), id(inteiro), quantidade(inteiro) e observação(string)
    Saída: 1, se a atualização ocorreu sem erros, 0, se ocorreu com erros e atualiza a lista
    
    onQuerySucceededUpdate() - Sucesso ao atualizar a lista
    Entrada: Objeto corrente
    Saída: 1, se a atualização aconteceu

    onQueryFailedUpdate(sender, args) - Falha ao atualizar a lista
    Entrada: Objeto corrente
    Saída: 0, caso tenha havido algum problema ao atualizar a lista
 */

function updateListItem(listName, id, quant, obs) {
    var clientContext = new SP.ClientContext(appweburl);
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);
    var oList = siteContext.get_web().get_lists().getByTitle(listName);
    this.oListItem = oList.getItemById(id);

    oListItem.set_item('Quantidade0', quant);
    oListItem.set_item('Title', obs);

    oListItem.update();

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededUpdate), Function.createDelegate(this, this.onQueryFailedUpdate));
}

function onQuerySucceededUpdate() {
    //alert('Item updated!');
    console.log('Item updated!');
    return 0;
}

function onQueryFailedUpdate(sender, args) {
    //alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    console.log('Request update failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    return 1;
}

/*
   ddlPopulateBriefing() - Get na lista Briefing e adiciona seus itens com opção de seleção
    Entrada: Nome da lista(String), Condições de seleção tipo cam(String), Include colunas(String)
    Saída: Itens como opção da caixa de seleção

    ddlPopulateBriefingSucceeded(sender, args) - Sucesso no Get dos itens
    Entrada: Objeto corrente, Id da tag select(String),  Array com nome das colunas acompanhado de um bit para caso de lookupValue(String), Nome da lista do grupo de produtos(String), Array para armazenar(Array)
    Saída: Caixa de seleção populada com os itens das colunas e armazenadas em um array

    ddlPopulateBriefingFailed(sender, args) - Falha na requisição dos itens da lista
    Entrada: Objeto corrente
    Saída:  Notificação da falha durante a notificação
 */

function ddlPopulateBriefing() {
    var clientContext = new SP.ClientContext(appweburl);//URL do host
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);//URL do webpart
    var oList = siteContext.get_web().get_lists().getByTitle('Briefing');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Number\'>1</Value></Geq></Where></Query></View>');
    this.collListItem = oList.getItems(camlQuery);
    try {
        clientContext.load(collListItem, 'Include(Cliente, Id,DTEVENTO,Buffet)');//Alteração
    } catch (err) {
        console.log('Deu bode ' + err);
    }
    clientContext.executeQueryAsync(Function.createDelegate(this, this.ddlPopulateBriefingSucceeded), Function.createDelegate(this, this.ddlPopulateBriefingFailed));
}

function ddlPopulateBriefingSucceeded(sender, args) {
    var ddlBriefing = this.document.getElementById('ddlBriefing');
    ddlBriefing.options.length = 0;
    var listItemEnumerator = collListItem.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        ddlBriefing.options[ddlBriefing.options.length] = new Option(oListItem.get_item('Cliente').get_lookupValue(), oListItem.get_id());
        infoBriefingArray.push([oListItem.get_item('Cliente').get_lookupValue(),oListItem.get_item('DTEVENTO'),oListItem.get_item('Buffet')]);//Alteração
    }
    ExecuteOrDelayUntilScriptLoaded(ddlPopulateGrupo, 'sp.js');
} 

function ddlPopulateBriefingFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*
    ddlPopulateGrupo() - Get na lista grupo e adiciona seus itens como opção de seleção
    Entrada: Nome da lista(String), Condições de seleção tipo cam(String), Include colunas(String)
    Saída: Itens como opção da caixa de seleção

    ddlPopulateGrupoSucceeded(sender, args) - Sucesso no get dos itens
    Entrada: Objeto corrente
    Saída: Caixa de seleção populada com os grupos. Nome e código.

    ddlPopulateGrupoFailed(sender, args) - Falha no get dos itens
    Entrada: Objeto corrente
    Saída: Notificação de falha e mensagem de erro
 */

function ddlPopulateGrupo() {
    var clientContext = new SP.ClientContext(appweburl);//URL do host
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);//URL do webpart
    var oList = siteContext.get_web().get_lists().getByTitle('Grupos de Produtos');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Geq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Number\'>1</Value></Geq></Where><OrderBy><FieldRef Name="Title" Ascending="True" /></OrderBy></Query></View>');
    this.collListItem = oList.getItems(camlQuery);
    try {
        clientContext.load(collListItem, 'Include(Title, C_x00f3_digo)');
    } catch (err) {
        console.log('Deu bode ' + err);
    }
    clientContext.executeQueryAsync(Function.createDelegate(this, this.ddlPopulateGrupoSucceeded), Function.createDelegate(this, this.ddlPopulateGrupoFailed));
}

function ddlPopulateGrupoSucceeded(sender, args) {
    var ddlGrupo = this.document.getElementById('ddlGrupo');
    ddlGrupo.options.length = 0;
    var listItemEnumerator = collListItem.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        ddlGrupo.options[ddlGrupo.options.length] = new Option(oListItem.get_item('Title'), oListItem.get_item('C_x00f3_digo'));
    }
    //alert(document.getElementById('ddlGrupo').options[document.getElementById('ddlGrupo').selectedIndex].text);
    choice(document.getElementById('ddlGrupo'));
    //document.getElementById('ddlGrupo').click();
    //$('#ddlGrupo').find('option:first').attr('selected', 'selected');
//    ExecuteOrDelayUntilScriptLoaded(ddlPopulateProduto, 'sp.js');
}

function ddlPopulateGrupoFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*
 *  Função de teste
 */
function myFunction() {
    var x = document.getElementById("ddlGrupo").selectedIndex;
    var y = document.getElementById("ddlGrupo").options;
    var value = document.getElementById("ddlGrupo").value;
    var split = value.split(",");
    var v1 = split[0];
    var v2 = split[1];
    //alert("Index: " + y[x].index + " is " + y[x].text + "value:" + value);
    //alert("firstValue: " + v1 + ", secondValue: " + v2);
    console.log(carrinhoProdutosArray);
}

/*
    getItensProducaoEvento(evento) - Get na lista Saída de Itens do ESTOQUE para PRODUÇÃO para ser mostrada no ato de selação de um evento todos os produtos já adicionados a ele
    Entrada: Nome do evento (String)
    Saída: Todos os produtos relacionados ao evento

    onQuerySucceededProducaoEvento(sender, args) - Sucesso no get dos itens da lista
    Entrada: Objeto corrente
    Saída: Adiciona no carrinho todos os produtos já existentes do evento

    onQueryFailedProducaoEvento(sender, args) - Falha no get dos itens da lista
    Entrada: Objeto corrente
    Saída: Notificação de falha e erros relacionados a falha
 */

function getItensProducaoEvento(evento) {
    var clientContext = new SP.ClientContext(appweburl);//URL do host
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);//URL do webpart
    var oList = siteContext.get_web().get_lists().getByTitle('Saída de Itens do ESTOQUE para PRODUÇÃO');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><Eq><FieldRef Name=\'orcamento\'/><Value Type=\'Text\'>' + evento + '</Value></Eq></Where></Query></View>');
    //'<View><Query><Where><Eq><FieldRef Name=\'orcamento\'/><Value Type=\'Text\'>' + 'CLIENTE_TESTE' +'</Value></Eq></Where></Query></View>'
    this.collListItem = oList.getItems(camlQuery);
    try {
        clientContext.load(collListItem);
    } catch (err) {
        console.log('Deu bode' + err);
    }
    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceededProducaoEvento), Function.createDelegate(this, this.onQueryFailedProducaoEvento));
}

function onQuerySucceededProducaoEvento(sender, args) {
    var listItemInfo = '';
    var listItemEnumerator = collListItem.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        var orcamentoJSON = JSON.stringify(oListItem.get_item('orcamento'));
        var produtoJSON = JSON.stringify(oListItem.get_item('Produto'));
        var codigoJSON = JSON.stringify(oListItem.get_item('Produto_x003a_Codigo'));
        var estoqueJSON = JSON.stringify(oListItem.get_item('Produto_x003a_Quantidade_x0020_e'));
        //console.log(estoqueJSON);
        if (orcamentoJSON !== 'null' && produtoJSON !== 'null') {
            addNewProduct(document.getElementById('ddlBriefing').value, produtoJSON, oListItem.get_item('Quantidade0'), oListItem.get_item('dtsaidaorcamento'), oListItem.get_item('Title'), 1, oListItem.get_id(), codigoJSON, estoqueJSON);
        }        
    }
}

function onQueryFailedProducaoEvento(sender, args) {
    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

/*
    choiceBriefing(sele) - Inicializa o mestre detalhe do evento selecionado e deixa pronto para adição, remoção e atualização de produtos
    Entrada: Evento selecionado(String)
    Saída: Metre detalhe preenchido, caso já haja produtos relacionados, ou vazio, caso contrário   
 */

function choiceBriefing(sele) {
    var dataHoraE = separateDataHoraOnBriefing(getDataHoraEventoOnBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text));
    //var localE = getLocalEventoBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    var localE = JSON.stringify(getLocalEventoBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text));
    //var localE = JSON.parse(localE)['$5O_1'];
    //alert(JSON.parse(localE)['$5O_1']);
    if (localE !== 'null'){
        masterDetailHeader(dataHoraE.dataE, dataHoraE.horaE, JSON.parse(localE)[Object.keys(JSON.parse(localE))[1]]);       
        getItensProducaoEvento(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    }
    else {
        masterDetailHeader(dataHoraE.dataE, dataHoraE.horaE, "Local não definido");
        getItensProducaoEvento(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    }
    if (document.getElementById('ddlBriefing').options < 0) {
        alert("Nenhum evento selecionado!");
    }
    else {
        //alert(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
        //alert(document.getElementById('ddlBriefing').selectedIndex);
        //alert(document.getElementById('ddlBriefing').value);
    }
    $(".below-bar").show();    
    briefingSelect = 1;
    //$('#briefingChoice').click(false);
    document.getElementById("briefingChoice").disabled = true;
    //alert($("#myDateField_1").val());
    //console.log($("#myDateField_1").text);

}

/*
    choice(select) - Inicializa lista de produtos relacionados ao grupo selecionado
    Entrada: Grupo selecionado
    Saída: Caixa de seleção de produtos preechida
 */

function choice(select) {
    //alert(select.options[select.selectedIndex].value);    
    ExecuteOrDelayUntilScriptLoaded(function () { ddlPopulateProduto(select.options[select.selectedIndex].value); }, 'sp.js');
    $("#txtAcrescimo").val(0);
    //$('#ddlProduto').find('option:first').attr('selected', 'selected');    
}

/*
    choiceImage(imgSelect) - Chama a função que altera a imagem exibida pela imagem do produto
    Entrada: Nome do produto(String)
    Saída: Imagem do produto e quanatidade disponível em estoque
 */

function choiceImage(imgSelect) {
    //alert(document.getElementById('ddlProduto').value);
    $("#txtAcrescimo").val(0);
    try {
        console.log(getImageOnProduct(imgSelect.options[imgSelect.selectedIndex].text));
    }
    catch (err) {
        console.log('Deu bode' + err);
    }
    //getImageOnProduct(imgSelect.options[imgSelect.selectedIndex].text);
}
/*
    Routine to find element in array
 */

function getImageOnProduct(productText) {
    for (var i = 0; i < infoProdutosArray.length; i++){
        //alert(productText + ' = ' + infoProdutosArray[i][0]);
        //alert(infoProdutosArray[i][0].length + ' div' + productText.length);
        if (infoProdutosArray[i][0] === productText) {                                    
            $("#imgPreview").attr("src", infoProdutosArray[i][1]);
            //console.log(infoProdutosArray[i][3]);
            if (infoProdutosArray[i][3] !== null){//verificar se esse retorno é null mesmo
                $("#qtdEstoque").text('Em estoque: ' + infoProdutosArray[i][3]);                
            }
            else {
                $("#qtdEstoque").text('Em estoque: ' + '0');
            }
            $('#qtdEstoque').show();
            return infoProdutosArray[i][1];
        }
    }
    //$("#imgPreview").attr("src", "https://rosalvoponte.sharepoint.com/sites/sgs/sge/Catlogo%20de%20Produtos/Produto%20sem%20imagem.jpg");
    //$("#qtdEstoque").text('Em estoque: ' + '0');
    //$('#qtdEstoque').show();
    return "https://rosalvoponte.sharepoint.com/sites/sgs/sge/Catlogo%20de%20Produtos/Produto%20sem%20imagem.jpg";
}


function getCodigoOnProduct(productText) {
    for (var i = 0; i < infoProdutosArray.length; i++) {
        if (infoProdutosArray[i][0] === productText) {
            return infoProdutosArray[i][2];
        }
    }
}

function getQuantidadeEstoqueOnProduct(productText) {
    for (var i = 0; i < infoProdutosArray.length; i++) {
        //console.log('nome' + infoProdutosArray[i][0] + 'estoque' + infoProdutosArray[i][3]);
        if (infoProdutosArray[i][0] === productText) {
            //alert(infoProdutosArray[i][3]);
            return infoProdutosArray[i][3];
        }
    }
    return 0;
}

/*
 * Novas funções
 */
function getDataHoraEventoOnBriefing(productText) {
    for (var i = 0; i < infoBriefingArray.length; i++) {
        if (infoBriefingArray[i][0] === productText) {
            //alert(infoBriefingArray[i][1]);
            return infoBriefingArray[i][1];
        }
    }
}

function getLocalEventoBriefing(productText) {
    for (var i = 0; i < infoBriefingArray.length; i++) {
        if (infoBriefingArray[i][0] === productText) {
            //alert(infoBriefingArray[i][2]);
            return infoBriefingArray[i][2];
        }
    }
}

function separateDataHoraOnBriefing(dataHoraBriefing) {
    var date = new Date(dataHoraBriefing);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var hour = date.getHours();
    var minutes = date.getMinutes();
    //alert(day + '/' + month + '/' + year);
    //alert(hour + ':' + minutes);
    if (hour !== 0) {
        hour = hour - 1;
    }
    if (hour < 10 && minutes < 10){
        return { dataE: day + '/' + month + '/' + year, horaE: '0' + hour + ':' + '0' + minutes };
    }
    else if (hour < 10) {
        return { dataE: day + '/' + month + '/' + year, horaE: '0' + hour + ':' + minutes };
    }
    else if (minutes < 10){
        return { dataE: day + '/' + month + '/' + year, horaE: hour + ':' + '0' + minutes };
    }
    else {
        return { dataE: day + '/' + month + '/' + year, horaE: hour + ':' + minutes };
    }
}

/*
    Select produt to add
*/
function ddlPopulateProduto(filter) {
    var clientContext = new SP.ClientContext(appweburl);//URL do host
    var siteContext = new SP.AppContextSite(clientContext, hostweburl);//URL do webpart
    console.log(clientContext + ' ' + siteContext);
    var oList = siteContext.get_web().get_lists().getByTitle('Produto');
    var camlQuery = new SP.CamlQuery();
    camlQuery.set_viewXml('<View><Query><Where><And><Geq><FieldRef Name=\'ID\'/>' +
        '<Value Type=\'Number\'>1</Value></Geq><Eq><FieldRef Name=\'Grupo\'/><Value Type=\'Number\'>'+ String(filter) +'</Value></Eq></And></Where><OrderBy><FieldRef Name="Title" Ascending="True" /></OrderBy></Query></View>');
    this.collListItem = oList.getItems(camlQuery);
    try {
        clientContext.load(collListItem,'Include(Title, Endere_x00e7_o_x0020_da_x0020_Im,Codigo,Quantidade_x0020_em_x0020_estoqu,Id)');
    } catch (err) {
        console.log('Deu bode ' + err);
    }
    clientContext.executeQueryAsync(Function.createDelegate(this, this.ddlPopulateProductoSucceeded), Function.createDelegate(this, this.ddlPopulateProductoFailed));
}

function ddlPopulateProductoSucceeded(sender, args) {
    infoProdutosArray = [];
    var ddlProduto = this.document.getElementById('ddlProduto');
    ddlProduto.options.length = 0;
    var listItemEnumerator = collListItem.getEnumerator();
    while (listItemEnumerator.moveNext()) {
        var oListItem = listItemEnumerator.get_current();
        var jsonImg = JSON.stringify(oListItem.get_item('Endere_x00e7_o_x0020_da_x0020_Im'), null, 2);
        ddlProduto.options[ddlProduto.options.length] = new Option(oListItem.get_item('Title'), oListItem.get_id());
        if (jsonImg !== 'null' && jsonImg !== null && jsonImg !== 'undefined') {
            infoProdutosArray.push([oListItem.get_item('Title'), JSON.parse(jsonImg)[Object.keys(JSON.parse(jsonImg))[1]], oListItem.get_item('Codigo'), oListItem.get_item('Quantidade_x0020_em_x0020_estoqu')]);
        }
        else {
            infoProdutosArray.push([oListItem.get_item('Title'), "https://rosalvoponte.sharepoint.com/sites/sgs/sge/Catlogo%20de%20Produtos/Produto%20sem%20imagem.jpg", oListItem.get_item('Codigo'), oListItem.get_item('Quantidade_x0020_em_x0020_estoqu')]);
        }
    }
    choiceImage(document.getElementById('ddlProduto'));
}

function ddlPopulateProductoFailed(sender, args) {
    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}


/*
    Button quantity
*/

function initQuant() {
    //var qtdEstProd = getQuantidadeEstoqueOnProduct($("#ddlProduto :selected").text());
    //alert($("#ddlProduto :selected").text());
    //alert(getQuantidadeEstoqueOnProduct($("#ddlProduto :selected").text()));
    $("#txtAcrescimo").val(0);
    //document.getElementById('btnAddProduto').disabled = true;
    $("#aumentaAcrescimo").click(function () {
        var qtdEstProd = getQuantidadeEstoqueOnProduct($("#ddlProduto :selected").text());
        var input = $("#txtAcrescimo")[0];
        var acrescimo = parseInt(input.value, 10) + 1;
        input.value = acrescimo;
        document.getElementById('btnAddProduto').disabled = acrescimo > 0 && $("#txtAcrescimo").val() <= qtdEstProd ? false : true;
    });

    $("#diminuiAcrescimo").click(function () {
        var qtdEstProd = getQuantidadeEstoqueOnProduct($("#ddlProduto :selected").text());
        var input = $("#txtAcrescimo")[0];
        var decrescimo = parseInt(input.value, 10) - 1;
        input.value = decrescimo < 1 ? 0 : decrescimo;
        document.getElementById('btnAddProduto').disabled = decrescimo < 1 || $("#txtAcrescimo").val() > qtdEstProd ? true : false;
    });
}  

function verifyQtd(quantidade) {
    //alert($("#ddlProduto :selected").text());
    var qtdEstProd = getQuantidadeEstoqueOnProduct($("#ddlProduto :selected").text());
    //alert(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text);
    //alert($("#txtAcrescimo").val());
    if ($("#txtAcrescimo").val() === '0' || $("#txtAcrescimo").val() > qtdEstProd) {
        //alert('enrou');
        //$('btnAddProduto').click(false);
        document.getElementById('btnAddProduto').disabled = true;
    }
    else {
        //alert('mudou');
        //$('btnAddProduto').click(true);
        document.getElementById('btnAddProduto').disabled = false;
    }
}

function existsInCarrinhoProdutosArray(productCode) {//Tá bugado
    for (var i = 0; i < carrinhoProdutosArray.length; i++) {
        //alert(typeof carrinhoProdutosArray[i][1] + typeof productCode);
        if (carrinhoProdutosArray[i][1] === productCode) {
            //alert(carrinhoProdutosArray[i][9]);
            //alert(carrinhoProdutosArray[i][5]);
            if (carrinhoProdutosArray[i][9] === 1 && carrinhoProdutosArray[i][5] === 2) {
                //alert('Entrou para readicionar');
                carrinhoProdutosArray[i][5] = 1;
                return 2;
            }
            else {
                //alert('Entrou para atualizar');                
                return 0;
            }
          // return true;
        }
    }
    return 1;
}

function updateCarrinhoProdutosArray(productCode) {
    for (var i = 0; i < carrinhoProdutosArray.length; i++) {
        if (carrinhoProdutosArray[i][1] === productCode) {
            //$("#imgPreview").attr("src", infoProdutosArray[i][1]);
            //alert('antes');
            console.log(carrinhoProdutosArray[i]);
            carrinhoProdutosArray[i][2] = parseInt(carrinhoProdutosArray[i][2]) + parseInt(document.getElementById('txtAcrescimo').value);
           // alert('depois');
            console.log(carrinhoProdutosArray[i]);
            //alert('havia: ' + carrinhoProdutosArray[i][2] + 'novo: ' + carrinhoProdutosArray[i][2] + document.getElementById('txtAcrescimo').value);
            //return true;
        }
    }
}

function atualizarTabela(productText) {
    var tableRef = document.getElementById('tablePrint');
    //alert(tableRef.rows[tableRef.rows.length-1].cells[0].innerHTML);
    for (var r = 4, n = tableRef.rows.length; r < n - 1; r++) {
        for (var c = 0, m = tableRef.rows[r].cells.length; c < m; c++) {
            //alert('row=' + r + 'cell=' + c);
            //createListItem('Saída de Itens do ESTOQUE para PRODUÇÃO', parseInt(carrinhoProdutosArray[0]), parseInt(carrinhoProdutosArray[1]));
            //console.log((tableRef.rows[r].cells[c].innerHTML));
            if (productText === tableRef.rows[r].cells[c].innerHTML) {
                // var a = tableRef.rows[r].cells[c].innerHTML;
                $("#qtdP" + (r - 4)).val(parseInt($("#qtdP" + (r - 4)).val()) + parseInt(document.getElementById('txtAcrescimo').value));
                //$("#qtdP" + (r - 4)).val() = parseInt($("#qtdP" + (r - 4)).val()) + parseInt(document.getElementById('txtAcrescimo').value);
                //alert(tableRef.rows[r].cells[c].innerHTML);
            }
        }
    }
}

function getRow(element) {
    var tableRef = document.getElementById('tablePrint');
    var r = confirm("O produto " + tableRef.rows[element.parentNode.parentNode.rowIndex].cells[1].innerHTML + " será excluído. Confirmar exclusão?");   
    //alert(tableRef.rows[element.parentNode.parentNode.rowIndex].cells[1].innerHTML);
    //alert(carrinhoProdutosArray[element.parentNode.parentNode.rowIndex - 4][5]);    
    //document.getElementById("myTable").deleteRow(0);    
    //alert(r);
    if (r === true) {//Está bugado
        //alert(carrinhoProdutosArray[element.parentNode.parentNode.rowIndex - 4][5])
        if (carrinhoProdutosArray[element.parentNode.parentNode.rowIndex - 4][9] === 1) {
            //alert("Entrou p excluir");
            carrinhoProdutosArray[element.parentNode.parentNode.rowIndex - 4][5] = 2;
        }
        else {
            //alert('excluir do carrinho');
            //carrinhoProdutosArray.splice((element.parentNode.parentNode.rowIndex - 4),1);
        }
        //carrinhoProdutosArray[element.parentNode.parentNode.rowIndex - 4][5] = 2;        
        tableRef.deleteRow(element.parentNode.parentNode.rowIndex);
        excluidos = excluidos + 1;
    } else {
        console.log('O produto ' + tableRef.rows[element.parentNode.parentNode.rowIndex].cells[1].innerHTML + ' não foi exluído.');
    }
    console.log(carrinhoProdutosArray);
}

function getQuantEst(prodName) {
    for (var i = 0; i < carrinhoProdutosArray.length; i++) {
        //alert(carrinhoProdutosArray[i][7] + ' - ' + prodName);
        if (carrinhoProdutosArray[i][7] === prodName) {            
            return carrinhoProdutosArray[i][8];
        }
    }
    return 0;
}

function changeQtd(element) {
    var tableRef = document.getElementById('tablePrint');
    var qtdEstProd = getQuantEst(String(tableRef.rows[element.parentNode.parentNode.rowIndex].cells[1].innerHTML));
    //alert(tableRef.rows[element.parentNode.parentNode.rowIndex].cells[1].innerHTML);    
    //alert(document.getElementById("qtdP" + element.parentNode.parentNode.rowIndex - 4));
    //console.log($("#qtdP" + (element.parentNode.parentNode.rowIndex - 4)).val());
    //alert(element.parentNode.parentNode.rowIndex - 4);
    //alert('Em estoque: ' + qtdEstProd);
    //alert(parseInt($("#qtdP" + (element.parentNode.parentNode.rowIndex - 4)).val()) === 0);
    if ($("#qtdP" + (element.parentNode.parentNode.rowIndex - 4)).val() === '0') {
        //alert('entrou aqui');
        carrinhoProdutosArray[element.parentNode.parentNode.rowIndex - 4][5] = 2;
    }
    else if ($("#qtdP" + (element.parentNode.parentNode.rowIndex - 4)).val() < 0) {
        $("#qtdP" + (element.parentNode.parentNode.rowIndex - 4)).val(0);
        carrinhoProdutosArray[element.parentNode.parentNode.rowIndex - 4][2] = 0;
    }
    else if ($("#qtdP" + (element.parentNode.parentNode.rowIndex - 4)).val() > qtdEstProd) {
        //alert("Em estoque: " + qtdEstProd);
        $("#qtdP" + (element.parentNode.parentNode.rowIndex - 4)).val(qtdEstProd);
        carrinhoProdutosArray[element.parentNode.parentNode.rowIndex - 4][2] = qtdEstProd;
    }
    else {
        carrinhoProdutosArray[element.parentNode.parentNode.rowIndex - 4][2] = $("#qtdP" + (element.parentNode.parentNode.rowIndex - 4)).val();
    }
}


function addNewProduct() {
    var tableRef = document.getElementById('tablePrint');
    var lastRow = tableRef.rows.length;
    var newRow = tableRef.insertRow(lastRow);//lastRow - 1
    //var dataHoraE = separateDataHoraOnBriefing(getDataHoraEventoOnBriefing(document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text));
    if (arguments.length > 0) {
        var idEvento = arguments[0];
        var idProduto = arguments[1];
        var qtd = arguments[2];
        var dta = arguments[3];
        var obs = arguments[4];
        var duty = arguments[5];
        var idClienteProdutoUpdate = arguments[6];
        var codProd = arguments[7];
        var quantEst = arguments[8];
        //alert(quantEst);
        //alert(convertDateFormat(separateDataHoraOnBriefing(dta).dataE));
        //alert(idProduto + ' ' + JSON.parse(idProduto)["$1k_1"]);
        $('#myDateField_1').val(separateDataHoraOnBriefing(dta).dataE.split("/")[0] + '/' + separateDataHoraOnBriefing(dta).dataE.split("/")[1] + '/' + separateDataHoraOnBriefing(dta).dataE.split("/")[2]);
        carrinhoProdutosArray.push([parseInt(idEvento), String(JSON.parse(idProduto)[Object.keys(JSON.parse(idProduto))[0]]), parseInt(qtd), convertDateFormat(separateDataHoraOnBriefing(dta).dataE), obs, duty, idClienteProdutoUpdate, String(JSON.parse(idProduto)[Object.keys(JSON.parse(idProduto))[1]]), parseInt(JSON.parse(quantEst)[Object.keys(JSON.parse(quantEst))[1]]),1]);
        //carrinhoProdutosArray[Evento,Produto,Quantidade,Data,Observação,Add/Update/Delete,IdEvento,IdProduto,QuantidadeEstoque,Flag]
        console.log(carrinhoProdutosArray);
        newCell = newRow.insertCell(0);
        newCell.innerHTML = JSON.parse(codProd)[Object.keys(JSON.parse(codProd))[1]];//getCodigoOnProduct(JSON.parse(idProduto)["$5O_1"]);//nome produtoobs: Não tem o vetor
        newCell = newRow.insertCell(1);
        newCell.innerHTML = JSON.parse(idProduto)[Object.keys(JSON.parse(idProduto))[1]];//nome produto
        newCell = newRow.insertCell(2);       
        //newCell.innerHTML = qtd;//qtd
        newCell.innerHTML = '<input type="text" size="1" id="qtdP' + idProd + '" style="text-align:center;" value="' + qtd + '" onchange="changeQtd(this)"/>';
        newCell.style = 'text-align:center; widht:50px;';
        newCell = newRow.insertCell(3);
        newCell.colSpan = 4;
        if (obs !== null){
            newCell.innerHTML = '<input type="text" size=50 maxlength="255"' + 'value="' + obs + '" id="obs' + numObs + '"></input>';//obs
        }
        else {
            newCell.innerHTML = '<input type="text" size=50 maxlength="255"' + 'value="" id="obs' + numObs + '"></input>';//obs
        }       
        newCell = newRow.insertCell(4);
        newCell.innerHTML = '<img src="../Images/excluir.png" style="width:23px;height:23px;" onclick="getRow(this)"/>'
        numObs = numObs + 1;
        idProd = idProd + 1;
        //newCell.colSpan = 3;
        newRow.appendChild(newCell);
    }
    else {
        //args = arguments.length > 0 ? arguments : null;
        if ($("#myDateField_1").val() !== '' && document.getElementById('txtAcrescimo').value !== '0' && briefingSelect !== 0) {
            if (existsInCarrinhoProdutosArray(document.getElementById('ddlProduto').value) === 0) {
                //alert(document.getElementById('ddlProduto').value);
                //alert('Atualizou');
                updateCarrinhoProdutosArray(document.getElementById('ddlProduto').value);                
                atualizarTabela($("#ddlProduto :selected").text());
            }
            else if (existsInCarrinhoProdutosArray(document.getElementById('ddlProduto').value) === 1){
                //compareDatas($('#myDateField_1').val(),dataHoraE.dataE);                
                //existsInCarrinhoProdutosArray(document.getElementById('ddlProduto').value);
                carrinhoProdutosArray.push([document.getElementById('ddlBriefing').value, document.getElementById('ddlProduto').value, document.getElementById('txtAcrescimo').value, convertDateFormat($('#myDateField_1').val()), 'Nenhuma Observação', 0, -1, $("#ddlProduto :selected").text(), parseInt($("#qtdEstoque").text().split(" ")[2]),0]);
                //carrinhoProdutosArray[Evento, Produto, Quantidade, Data, Observação, Add / Update / Delete, IdEvento, IdProduto, QuantidadeEstoque, Flag]
                //console.log(carrinhoProdutosArray);
                //alert(document.getElementById('ddlProduto').value);
                newCell = newRow.insertCell(0);
                newCell.innerHTML = getCodigoOnProduct($("#ddlProduto :selected").text());
                newCell = newRow.insertCell(1);
                newCell.innerHTML = $("#ddlProduto :selected").text();
                newCell = newRow.insertCell(2);
                //newCell.innerHTML = document.getElementById('txtAcrescimo').value;
                newCell.innerHTML = '<input type="text" size="1" id="qtdP' + idProd + '" style="text-align:center;" value="' + document.getElementById('txtAcrescimo').value + '" onchange="changeQtd(this)"/>';
                newCell.style = 'text-align:center; widht:50px;';
                newCell = newRow.insertCell(3);
                //newCell = newRow.insertCell(4);
                newCell.innerHTML = '<input type="text" size=50 maxlength="255" id="obs' + numObs + '"></input>';
                newCell.colSpan = 4;
                newCell = newRow.insertCell(4);
                newCell.innerHTML = '<img src="../Images/excluir.png" style="width:23px;height:23px;" onclick="getRow(this)"/>'
                numObs = numObs + 1;        
                idProd = idProd + 1;
                newRow.appendChild(newCell);
            }
            else {
                //alert('Readicionando um produto');
                newCell = newRow.insertCell(0);
                newCell.innerHTML = getCodigoOnProduct($("#ddlProduto :selected").text());
                newCell = newRow.insertCell(1);
                newCell.innerHTML = $("#ddlProduto :selected").text();
                newCell = newRow.insertCell(2);
                //newCell.innerHTML = document.getElementById('txtAcrescimo').value;
                newCell.innerHTML = '<input type="text" size="1" id="qtdP' + idProd + '" style="text-align:center;" value="' + document.getElementById('txtAcrescimo').value + '" onchange="changeQtd(this)"/>';
                newCell.style = 'text-align:center; widht:50px;';
                newCell = newRow.insertCell(3);
                //newCell = newRow.insertCell(4);
                newCell.innerHTML = '<input type="text" size=50 maxlength="255" id="obs' + numObs + '"></input>';
                newCell.colSpan = 4;
                newCell = newRow.insertCell(4);
                newCell.innerHTML = '<img src="../Images/excluir.png" style="width:23px;height:23px;" onclick="getRow(this)"/>'
                numObs = numObs + 1;
                idProd = idProd + 1;
                newRow.appendChild(newCell);
            }
        }
        else if (briefingSelect === 0) {
            //alert('Você deve escolher um evento e clicar em confirmar para adicionar produtos.');
            $('#briefingError').show();
        } else if (document.getElementById('txtAcrescimo').value === '0') {
            alert('A quantidade deve ser maior que zero.');
        }
        else {
            //alert('Você deve selecionar uma data de saída antes de adicionar um produto.');
            $('#dtaError').show();
        }
    }
}

function compareDatas(data) {
    var data1 = $('#myDateField_1').val();
    alert(data1);
    var nova_data1 = parseInt(data1.split("/")[2] + data1.split("/")[1] + data1.split("/")[0]);
    var nova_data2 = parseInt(dataEventoComparar.split("/")[2] + dataEventoComparar.split("/")[1] + dataEventoComparar.split("/")[0]);
    if (nova_data2 > nova_data1) {
        console.log("A data do Evento é maior que a data informada.");
        //data1 = $('#myDateField_1').val("");
    }
    else if (nova_data1 == nova_data2)
        console.log("As datas são iguais.");
    else
        console.log("A data do Evento é menor que a data informada");
}

function clearAllValues() {
    briefingSelect = 0;
    errorAddProduct = 0;
    numObs = 0;
    idProd = 0;
    dataEventoComparar = "";
    carrinhoProdutosArray = [];
    $('finalizarPedido').click(true);
    document.getElementById("briefingChoice").disabled = false;
    $("#tablePrint").empty();//Usar para limpar tudo
    $(".below-bar").hide();
    $('#myDateField_1').val('');
    $('#qtdEstoque').hide();
    $("#txtAcrescimo").val(0);
    $('#dtaError').hide();
    $('#briefingError').hide();
    //masterDetailHeader();
}

function masterDetailHeader(dataEvento, horaEvento, localEvento) {    
    // Get a reference to the table
    dataEventoComparar = dataEvento;
    var tableRef = document.getElementById('tablePrint');
    //var lastRow = tableRef.rows.length;
    //var lastCol = tableRef.rows.length;

    // Insert a row in the table at row index 0
    var newRow = tableRef.insertRow(-1);
    // Insert a cell in the row at index 0
    var newCell = newRow.insertCell(0);

    newCell.rowSpan = 3;
    newCell.style = 'width: 100px; color: red;';
    newCell.innerHTML = 'Rosalvo Ponte';
    newRow.appendChild(newCell);

    newCell = newRow.insertCell(1);
    newCell.rowSpan = 3;
    newCell.colSpan = 2;
    newCell.style = 'width: 200px; color: red; text-align:center;';
    newCell.innerHTML = document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text;

    newCell = newRow.insertCell(2);
    newCell.style = 'width: 40px; color: red; text-align: left;';
    newCell.innerHTML = 'Data';

    newCell = newRow.insertCell(3);
    newCell.innerHTML = dataEvento;
    newCell.colSpan = 3;//alt

    newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.style = 'width: 40px; color: red; text-align: left;';
    newCell.innerHTML = 'Hora';
    newCell = newRow.insertCell(1);
    newCell.colSpan = 3;//alt
    newCell.innerHTML = horaEvento;

    newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.style = 'width: 40px; color: red; text-align: left;';
    newCell.innerHTML = 'Local';
    newCell = newRow.insertCell(1);
    newCell.innerHTML = localEvento;

    newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.innerHTML = 'Código';
    newCell = newRow.insertCell(1);
    newCell.style = 'width: 200px; color: red; min-width:300px; text-align:center;';
    newCell.innerHTML = 'Descrição';
    newCell = newRow.insertCell(2);
    newCell.innerHTML = 'Quantidade';
    newCell.style = 'width: 40px; text-align: center;';
    newCell = newRow.insertCell(3);
    newCell.colSpan = 3;//alt
    newCell.innerHTML = 'Observação';
    newCell.style = 'width: 40px; text-align: center;';
    //newCell = newRow.insertCell(4);
    //newCell.innerHTML = 'Total';

    /*newRow = tableRef.insertRow(-1);
    newCell = newRow.insertCell(0);
    newCell.colSpan = 4;
    newCell.style = 'width: 100%;';
    newCell.innerHTML = 'Total';
    newCell = newRow.insertCell(1);*/
}

function addObservacaoOnCarrinho() {
    var tableRef = document.getElementById('tablePrint');
    for (var r = 4, n = tableRef.rows.length, j = 0; r < n; r++ , j++) {
        //alert($('#obs' + i).val());
        //alert(r + ' ' + n);
        //alert(carrinhoProdutosArray[j][4]);
        try {
            console.log('carro: ' + carrinhoProdutosArray[j][4] + ' ' + ' obs' + $('#obs' + j).val());
            carrinhoProdutosArray[j][4] = $('#obs' + j).val();
        }
        catch (err) {
            console.log(err);
        }
    }
}

function novoEvento() {
    var r = confirm("Você perderá todos os pedidos adicionados no atual evento. Deseja continuar?"); 
    if (r === true) {
        //$('finalizarPedido').click(false);
        clearAllValues();
        //$('#briefingChoice').click(true);
        document.getElementById("briefingChoice").disabled = false;
    } else {
        console.log('Novo evento cancelado!');
    }
}

function addPedidoOnSaidaEstoque() {
    var tableRef = document.getElementById('tablePrint');
    //var i = 0;
    $('finalizarPedido').click(false);
    addObservacaoOnCarrinho();    
    for (var r = 4, n = tableRef.rows.length + excluidos, i = 0; r < n; r++ , i++) {
        try {        
            if (carrinhoProdutosArray[i][5] === 0) {
                //alert('nao devia entrar aqui');
                createListItem('Saída de Itens do ESTOQUE para PRODUÇÃO', parseInt(carrinhoProdutosArray[i][0]), parseInt(carrinhoProdutosArray[i][1]), parseInt(carrinhoProdutosArray[i][2]), carrinhoProdutosArray[i][3], carrinhoProdutosArray[i][4]);
            }
            else if (carrinhoProdutosArray[i][5] === 1) {
                updateListItem('Saída de Itens do ESTOQUE para PRODUÇÃO', parseInt(carrinhoProdutosArray[i][6]), parseInt(carrinhoProdutosArray[i][2]), carrinhoProdutosArray[i][4]);
            }       
            else if (carrinhoProdutosArray[i][5] === 2){
                deleteListItem('Saída de Itens do ESTOQUE para PRODUÇÃO', parseInt(carrinhoProdutosArray[i][6]));
            }
        }
        catch (err){
            console.log(err);
        }
    }
    if (errorAddProduct === 1){
        alert('Houve algum problema ao adicionar pelo menos um dos produtos adicionados.');
    }
    else {
        //alert('O pedido para ' + document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text + ' foi finalizado com sucesso!');
        //clearAllValues();
    }
    alert('O pedido para ' + document.getElementById('ddlBriefing').options[document.getElementById('ddlBriefing').selectedIndex].text + ' foi finalizado com sucesso!');
    clearAllValues();
}

/*
 *  Initialize datepicker 
 */
function initializeDatePickers() {
    var calendarOptions = [];
    //calendarOptions.push(_spPageContextInfo.webServerRelativeUrl + '/' + _spPageContextInfo.layoutsUrl + '/iframe.aspx?');
    //console.log(_spPageContextInfo.webServerRelativeUrl + '/' + _spPageContextInfo.layoutsUrl + '/iframe.aspx?');
    calendarOptions.push('/sites/sgs/sge/Itensparaproducao/_layouts/15/iframe.aspx?');
    calendarOptions.push('&cal=1');
    calendarOptions.push('&lcid=1046');
    calendarOptions.push('&langid=1046');
    calendarOptions.push('&tz=-08:00:00.0002046');
    calendarOptions.push('&ww=0111110');
    calendarOptions.push('&fdow=0');
    calendarOptions.push('&fwoy=0');
    calendarOptions.push('&hj=0');
    calendarOptions.push('&swn=false');
    calendarOptions.push('&minjday=109207');
    calendarOptions.push('&maxjday=2666269');
    calendarOptions.push('&date=');

    $('[field-type="DateTime"]').each(function (index) {
        var id = $(this).attr('id');
        $(this).after('<iframe id="' + id + 'DatePickerFrame" title="Select a date from the calendar." style="display:none; position:absolute; width:200px; z-index:101;" src="/_layouts/15/images/blank.gif?rev=23"></iframe>');
        $(this).after('<a href="#" style="vertical-align:-10px;"><img style="margin-top:-5px;" id="' + id + 'DatePickerImage" border="0" alt="Select a date from the calendar." src="/_layouts/15/images/calendar_25.gif?rev=23"></a>');
        $(this).next('a').attr('onclick', "clickDatePicker('" + id + "', '" + calendarOptions.join('') + "', '', event); return false;");
    });
}