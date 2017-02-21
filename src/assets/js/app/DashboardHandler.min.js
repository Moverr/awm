/* global handlers, user, loanList, clientList, currencyCode, doHistoryUpdate */

var DashboardHandler = function() {
    DashboardHandler.self = this;
    DashboardHandler.self.registerHandlers();
    loanList.addEntityChangedEventListenerCallback(DashboardHandler.prototype._entityChanged);
};

DashboardHandler.prototype.registerHandlers = function() {
    $('#dashboardArea button[data-target]').on('click touch', DashboardHandler.prototype.buttonHandler);
};

DashboardHandler.prototype.buttonHandler = function(event) {
    event.preventDefault();
    $('#' + $(this).data('target') + ' a').click();
};

/* external */
DashboardHandler.prototype.init = function() {
    DashboardHandler.self.overview();
};

DashboardHandler.prototype.overview = function() {
    addHistory('Dashboard overview', '#dashboardOverview', '#dashboard');
    initDefaultContent('Dashboard');
    
    DashboardHandler.self.showOverview();
    DashboardHandler.self.showLoanApplications();
    DashboardHandler.self.showProfile();
    
    showContent($('#dashboardArea'));
};

DashboardHandler.prototype.addLoan = function(loan) {
    var $row = null;
    if (loan.status === 'SUBMITTED') {
        var $rowContainer = $('#dashboardLoanApplications table tbody');
        $rowContainer.find('[data-id="' + loan.loanId + '"]').remove();
        var loanHandler=handlers['Loan'];
        var loanHandlerDefined=(typeof(loanHandler)!=='undefined'&& loanHandler!==null);
        var loanObj={
            img: '<img src="images/personPlaceholderNoText.png" alt="" height="28" />',
            name: loan.clientName,
            date: formatDate(loan.disbursementDate),
            principal: formatCurrency(loan.principal) + ' ' + currencyCode,
            interest: formatPercentageShort(loan.interestRate) + '%',
            duration: loan.duration + 'd'
        }
        $row = addRow($rowContainer,loanObj ,loanHandlerDefined?loan:null,loanHandlerDefined?loanHandler.rowClickHandler:null, loan.loanId);
        addClassToColumnOfTableRow($row, 1, 'image');
        addClassToColumnOfTableRow($row, 2, 'prefix');
    }
    return $row;
};

DashboardHandler.prototype.showOverview = function() {
    var $dashboardOverview = $('#dashboardOverview');
    
    DashboardHandler.self.loadOverviewReport('Clients');
    DashboardHandler.self.loadOverviewReport('LoanApplications');
    DashboardHandler.self.loadOverviewReport('SavingsAccounts');
    
    ajax('/tenant/v1d/mis/clientActivityReport', 'GET', function (report) {
        $('#dashboardOverviewReportActiveClients').find('td:last-child').html(report.active);
        $('#dashboardOverviewReportPassiveClients').find('td:last-child').html(report.passive);
    });
    
    showContent($dashboardOverview);
};

DashboardHandler.prototype.showLoanApplications = function() {
    currentTable = 'dashboardLoanApplications';
    
    var $table = $('#dashboardLoanApplications table');
    var $rowContainer = $table.find('tbody');
    $rowContainer.empty();
    loanList.getSubmittedLoanList().forEach(function(entry) {
        DashboardHandler.self.addLoan(entry);
    });
    
    addClassToTableColumn($table, 0, 'image');
    addClassToTableColumn($table, 1, 'prefix');
    
    showContent($('#dashboardArea'));
};

DashboardHandler.prototype.showProfile = function() {
    var $dashboardProfile = $('#dashboardProfile');
    $dashboardProfile.find('input[data-target]').each(function() {
        $(this).val(getTargetFromObject($(this), user));
    });
    showContent($dashboardProfile);
};

DashboardHandler.prototype._entityChanged = function(loan) {
    if ('dashboardLoanApplications' === currentTable) {
        DashboardHandler.self.addLoan(loan);
    }
};

DashboardHandler.prototype.loadOverviewReport = function(type) {
    ajax('/tenant/v1d/mis/new' + type + 'Report', 'GET', function(dashboardOverviewReport) {
        var text = type.split(/(?=[A-Z])/).join(' ').toLowerCase();
        var $row = $('#dashboardOverviewReportNew' + type);
        $row.empty();
        $row.append($('<td class="prefix">New ' + text + '</td>'));
        $row.append($('<td>' + dashboardOverviewReport.day + '</td>'));
        $row.append($('<td>' + dashboardOverviewReport.week + '</td>'));
        $row.append($('<td>' + dashboardOverviewReport.month + '</td>'));
        $row.append($('<td>' + dashboardOverviewReport.year + '</td>'));
        $row.on('click touch', DashboardHandler.prototype.overviewReportRowClickHandler);
    });
};

DashboardHandler.prototype.overviewReportRowClickHandler = function() {
    var id = $(this).attr('id').substr(26);
    var type = id.endsWith('Applications') ? 'Applications' : 'All';
    var handler = id.replace('Application', '').slice(0, -1);
    var link = $('li.subitem[data-handler="' + handler + '"][data-action="get' + type + '"] a');
    link.click();
};
