
        // ============================================
        // CYBERDELIC NEXUS FINANCIAL MATRIX
        // Interactive Calculator Engine
        // ============================================

        // CONSOLIDATED DOMContentLoaded Handler - All initialization in one place
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 DOM loaded, initializing Financial Matrix...');

            // ============================================
            // STEP 1: Tab Navigation Listeners
            // ============================================
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    console.log('Tab clicked:', tab.dataset.section);
                    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                    tab.classList.add('active');
                    document.getElementById(tab.dataset.section).classList.add('active');

                    // FIX 3: Draw chart when switching to One-Pager tab
                    if (tab.dataset.section === 'onepager') {
                        console.log('🔄 Switched to One-Pager tab, will draw chart in 100ms...');
                        setTimeout(() => {
                            console.log('⏰ Timeout complete, drawing chart now...');
                            drawOnePagerRevenueChart();
                        }, 100);
                    }
                });
            });
            console.log('✅ Navigation initialized, tabs:', document.querySelectorAll('.nav-tab').length);

            // ============================================
            // STEP 2: Scenario Pill Listeners
            // ============================================
            document.querySelectorAll('.scenario-pill').forEach(pill => {
                pill.addEventListener('click', () => {
                    document.querySelectorAll('.scenario-pill').forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                    updateProjectionChart(pill.dataset.scenario);
                });
            });
            console.log('✅ Scenario pills initialized');

            // ============================================
            // STEP 3: All Input Event Listeners
            // ============================================
            console.log('🔧 Attaching event listeners...');

            // Capital Raise inputs
            ['monthly-burn', 'current-cash', 'pre-money'].forEach(id => {
                document.getElementById(id).addEventListener('input', () => {
                    updateCapitalCalcs();
                    updateSafeEquityCalcs();
                    updateAllConnectedValues();
                });
            });

            // Cash on hand synchronization event listeners
            document.getElementById('cash-slider').addEventListener('input', function () {
                document.getElementById('cash-input-ops').value = this.value;
                document.getElementById('current-cash').value = this.value;
                document.getElementById('cash-display').textContent = formatCurrency(parseFloat(this.value));
                updateOperationsCalcs();
            });

            document.getElementById('cash-input-ops').addEventListener('input', function () {
                document.getElementById('cash-slider').value = this.value;
                document.getElementById('current-cash').value = this.value;
                document.getElementById('cash-display').textContent = formatCurrency(parseFloat(this.value) || 0);
                updateOperationsCalcs();
            });

            // Update Operations tab when Capital Raise cash is changed
            document.getElementById('current-cash').addEventListener('input', function () {
                const cashSlider = document.getElementById('cash-slider');
                const cashInputOps = document.getElementById('cash-input-ops');
                if (cashSlider && cashInputOps) {
                    cashSlider.value = this.value;
                    cashInputOps.value = this.value;
                    document.getElementById('cash-display').textContent = formatCurrency(parseFloat(this.value) || 0);
                }
            });

            document.getElementById('runway-target').addEventListener('input', () => {
                updateCapitalCalcs();
                updateAllConnectedValues();
            });

            ['investment-amount', 'safe-cap'].forEach(id => {
                document.getElementById(id).addEventListener('input', () => {
                    updateSafeEquityCalcs();
                    updateAllConnectedValues();
                });
            });

            // Attach revenue listeners
            attachRevenueListeners();

            // Fixed and variable cost listeners
            document.querySelectorAll('.fixed-cost, .variable-cost').forEach(input => {
                input.addEventListener('input', updateOperationsCalcs);
            });

            document.getElementById('cash-slider').addEventListener('input', updateOperationsCalcs);

            console.log('✅ Event listeners attached successfully');

            // ============================================
            // STEP 4: Tooltip Initialization
            // ============================================
            console.log('Initializing tooltips...');
            const helpIcons = document.querySelectorAll('.help-icon[data-tooltip], .help-icon-inline[data-tooltip]');
            console.log('Found', helpIcons.length, 'help icons with tooltips');

            helpIcons.forEach((icon, index) => {
                const tooltipText = icon.getAttribute('data-tooltip');
                console.log(`Tooltip ${index}:`, tooltipText);

                icon.addEventListener('mouseenter', (e) => {
                    const tooltip = e.target.getAttribute('data-tooltip');
                    if (!tooltip) return;

                    // Remove any existing tooltips
                    document.querySelectorAll('.tooltip').forEach(t => t.remove());

                    // Create new tooltip
                    const tooltipEl = document.createElement('div');
                    tooltipEl.className = 'tooltip active';
                    tooltipEl.textContent = tooltip;

                    // Use fixed positioning for better visibility
                    tooltipEl.style.position = 'fixed';
                    tooltipEl.style.background = 'var(--bg-card)';
                    tooltipEl.style.border = '1px solid var(--accent-cyan)';
                    tooltipEl.style.borderRadius = '8px';
                    tooltipEl.style.padding = '0.75rem';
                    tooltipEl.style.minWidth = '200px';
                    tooltipEl.style.maxWidth = '320px';
                    tooltipEl.style.boxShadow = '0 4px 20px rgba(0, 212, 255, 0.3)';
                    tooltipEl.style.zIndex = '10000';
                    tooltipEl.style.fontSize = '0.875rem';
                    tooltipEl.style.lineHeight = '1.5';
                    tooltipEl.style.color = 'var(--text-primary)';
                    tooltipEl.style.display = 'block';
                    tooltipEl.style.pointerEvents = 'none';

                    // Add to body for better positioning
                    document.body.appendChild(tooltipEl);

                    // Position tooltip relative to icon
                    const rect = e.target.getBoundingClientRect();
                    const tooltipRect = tooltipEl.getBoundingClientRect();

                    // Position above icon, centered
                    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
                    let top = rect.top - tooltipRect.height - 8;

                    // Adjust if tooltip goes off screen
                    if (left < 10) left = 10;
                    if (left + tooltipRect.width > window.innerWidth - 10) {
                        left = window.innerWidth - tooltipRect.width - 10;
                    }
                    if (top < 10) {
                        // Show below instead
                        top = rect.bottom + 8;
                    }

                    tooltipEl.style.left = left + 'px';
                    tooltipEl.style.top = top + 'px';

                    // Store reference for cleanup
                    e.target._tooltip = tooltipEl;
                });

                icon.addEventListener('mouseleave', (e) => {
                    if (e.target._tooltip) {
                        e.target._tooltip.remove();
                        e.target._tooltip = null;
                    }
                });
            });

            // ============================================
            // STEP 5: MutationObserver for Chart Auto-Updates
            // ============================================
            console.log('🔍 Setting up MutationObserver for chart auto-updates...');
            // Watch for changes to revenue projection totals
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'characterData') {
                        console.log('🔄 Revenue values changed, redrawing chart...');
                        drawOnePagerRevenueChart();
                    }
                });
            });

            // Watch specific elements
            const targets = [
                document.getElementById('onepager-year1-revenue'),
                document.getElementById('onepager-year2-revenue'),
                document.getElementById('onepager-year3-revenue')
            ];

            targets.forEach(target => {
                if (target) {
                    observer.observe(target, { childList: true, characterData: true, subtree: true });
                }
            });

            // Resize listener
            window.addEventListener('resize', () => {
                const onepager = document.getElementById('onepager');
                if (onepager && (onepager.classList.contains('active') || onepager.style.display !== 'none')) {
                    drawOnePagerRevenueChart();
                }
            });

            // Initial check
            setTimeout(() => {
                const onepager = document.getElementById('onepager');
                if (onepager && onepager.classList.contains('active')) {
                    drawOnePagerRevenueChart();
                }
            }, 500);

            // Observe the revenue total elements
            const year1Total = document.getElementById('revenue-year1-total');
            const year2Total = document.getElementById('revenue-year2-total');
            const year3Total = document.getElementById('revenue-year3-total');

            if (year1Total) observer.observe(year1Total, { childList: true, characterData: true, subtree: true });
            if (year2Total) observer.observe(year2Total, { childList: true, characterData: true, subtree: true });
            if (year3Total) observer.observe(year3Total, { childList: true, characterData: true, subtree: true });

            // ============================================
            // STEP 6: Inline Editing Initialization
            // ============================================
            // Business Plan editable elements (only non-contenteditable ones)
            makeInlineEditable('#business-plan .feature-desc:not([contenteditable])');
            // Note: Most Business Plan content already uses contenteditable attribute
            // so we don't double-apply the inline editing system to those

            // ============================================
            // STEP 7: Run Initial Calculations (LAST)
            // ============================================
            console.log('🚀 Running initial calculations...');

            // Small delay to ensure all event listeners are fully attached
            setTimeout(function() {
                // Run all calculation functions to populate initial values
                updateRevenueCalcs();
                updateOperationsCalcs();
                updateCapitalCalcs();

                console.log('✅ Initial calculations complete');
                console.log('✅ Financial Matrix fully initialized and ready!');
            }, 100);
        });

        // Utility Functions
        const formatCurrency = (num) => {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(num);
        };

        const formatPercent = (num, decimals = 1) => {
            return (num * 100).toFixed(decimals) + '%';
        };

        // ============================================
        // CAPITAL RAISE CALCULATIONS
        // ============================================

        /**
         * CAPITAL RAISE CALCULATIONS
         * ===========================
         *
         * Purpose:
         * Calculate funding requirements based on burn rate and runway goals, then model
         * dilution scenarios for different raise amounts.
         *
         * Key Formulas:
         * -------------
         * 1. Funding Needed = (Monthly Burn × Target Runway) - Current Cash
         *    - Tells you how much capital to raise to reach runway target
         *
         * 2. Current Runway = Current Cash ÷ Monthly Burn
         *    - Months of operation remaining at current burn rate
         *
         * 3. Post-Money Valuation = Pre-Money Valuation + Investment Amount
         *    - Company value after investment closes
         *
         * 4. Investor Ownership % = Investment Amount ÷ Post-Money Valuation
         *    - Percentage of company owned by investors
         *
         * 5. Founder Ownership % = 100% - Investor % - Option Pool %
         *    - Remaining founder ownership (typically 10% reserved for options)
         *
         * 6. Exit Value = Founder % × Exit Valuation
         *    - Founder payout at hypothetical exit
         *
         * Inputs (DOM Elements):
         * ----------------------
         * - #monthly-burn: Monthly operating costs (from Operations tab)
         * - #current-cash: Available funds (synced with Operations tab cash-slider)
         * - #runway-target: Desired months of runway (slider: 6-36 months)
         * - #pre-money: Pre-investment company valuation
         *
         * Outputs (Updated Elements):
         * ---------------------------
         * - #funding-needed: Total capital required
         * - #runway-months: Current months of runway
         * - Dilution table rows for $250K, $500K, $1M scenarios
         * - #capital-warnings: Validation messages
         *
         * Connected Components:
         * ---------------------
         * - Operations tab: monthly-burn, cash-slider
         * - Dashboard: funding-gap, runway-display
         *
         * @fires updateAllConnectedValues() - Would cascade to dashboard if connected
         */
        function updateCapitalCalcs() {
            const monthlyBurn = parseFloat(document.getElementById('monthly-burn').value) || 0;
            const currentCash = parseFloat(document.getElementById('current-cash').value) || 0;
            const runwayTarget = parseFloat(document.getElementById('runway-target').value) || 18;
            const preMoney = parseFloat(document.getElementById('pre-money').value) || 2000000;

            document.getElementById('runway-target-display').textContent = runwayTarget + ' months';

            const fundingNeeded = (monthlyBurn * runwayTarget) - currentCash;
            document.getElementById('funding-needed').textContent = formatCurrency(Math.max(0, fundingNeeded));

            const raises = [250000, 500000, 1000000];
            const optionPool = 0.10;
            let tableHTML = '';

            raises.forEach(raise => {
                const postMoney = preMoney + raise;
                const investorPct = raise / postMoney;
                const founderPct = 1 - investorPct - optionPool;
                const exitValue = founderPct * 10000000;

                tableHTML += `
                    <tr>
                        <td>${formatCurrency(raise)}</td>
                        <td class="highlight">${formatPercent(investorPct)}</td>
                        <td>${formatPercent(founderPct)}</td>
                        <td>${formatCurrency(exitValue)}</td>
                    </tr>
                `;
            });

            document.getElementById('dilution-table').innerHTML = tableHTML;

            const currentRunway = monthlyBurn > 0 ? currentCash / monthlyBurn : 0;
            document.getElementById('runway-months').textContent = currentRunway.toFixed(1) + ' mo';
            document.getElementById('funding-gap').textContent = formatCurrency(Math.max(0, fundingNeeded));

            // ============================================
            // VALIDATION LOGIC
            // ============================================
            const warnings = [];
            const minRaise = Math.min(...raises);
            const maxRaise = Math.max(...raises);

            // Check if raise scenarios are sufficient
            if (fundingNeeded > 0 && minRaise < fundingNeeded) {
                warnings.push({
                    type: 'warning',
                    message: `Smallest raise scenario (${formatCurrency(minRaise)}) may not cover your funding need (${formatCurrency(fundingNeeded)}). Consider adjusting scenarios.`
                });
            }

            // Check runway status - Critical if < 6 months
            if (currentRunway < 6) {
                warnings.push({
                    type: 'critical',
                    message: 'Critical: Current runway is below 6 months. Initiate fundraising immediately.'
                });
            } else if (currentRunway < 12) {
                warnings.push({
                    type: 'warning',
                    message: 'Advisory: Current runway is below 12 months. Begin preparing for fundraising.'
                });
            }

            // Check dilution levels - Info if > 35%
            raises.forEach((raise, i) => {
                const postMoney = preMoney + raise;
                const investorPct = raise / postMoney;
                const dilution = investorPct;

                if (dilution > 0.35) {
                    warnings.push({
                        type: 'info',
                        message: `Scenario ${i + 1} (${formatCurrency(raise)}) involves ${formatPercent(dilution)} investor ownership, which exceeds typical seed range (15-35%).`
                    });
                }
            });

            // Display warnings
            const warningContainer = document.getElementById('capital-warnings');
            if (warningContainer) {
                if (warnings.length > 0) {
                    const warningHTML = warnings.map(w => {
                        const icon = w.type === 'critical' ? '🚨' : w.type === 'warning' ? '⚠️' : 'ℹ️';
                        return `<div class="alert alert-${w.type}">${icon} ${w.message}</div>`;
                    }).join('');

                    warningContainer.innerHTML = warningHTML;
                } else {
                    warningContainer.innerHTML = '';
                }
            }
        }

        // ============================================
        // SAFE VS EQUITY
        // ============================================

        function updateSafeEquityCalcs() {
            const investment = parseFloat(document.getElementById('investment-amount').value) || 0;
            const safeCap = parseFloat(document.getElementById('safe-cap').value) || 0;
            const preMoney = parseFloat(document.getElementById('pre-money').value) || 0;

            const postMoney = preMoney + investment;
            const equityOwnership = investment / postMoney;
            const safeOwnership = investment / safeCap;

            document.getElementById('safe-ownership').textContent = formatPercent(safeOwnership);
            document.getElementById('equity-dilution').textContent = formatPercent(equityOwnership);
            document.getElementById('equity-ownership').textContent = formatPercent(equityOwnership);
        }

        // ============================================
        // REVENUE CALCULATIONS
        // ============================================

        function updateRevenueCalcs() {
            // Society
            let societyMemberships = 0;
            let societyMembers = 0;
            document.querySelectorAll('.society-member').forEach(input => {
                const count = parseFloat(input.value) || 0;
                const priceId = input.dataset.priceId;
                const price = parseFloat(document.getElementById(priceId).value) || 0;
                societyMemberships += count * price;
                societyMembers += count;
            });

            const lifetimeMembers = parseFloat(document.getElementById('society-lifetime').value) || 0;
            const lifetimePrice = parseFloat(document.getElementById('price-lifetime').value) || 0;
            societyMemberships += lifetimeMembers * lifetimePrice;
            societyMembers += lifetimeMembers;

            // Calculate total events revenue (use actual if available, otherwise estimated)
            let societyEvents = 0;
            document.querySelectorAll('#society-events-list .event-item').forEach(item => {
                const actualInput = item.querySelector('.event-actual');
                const estimatedInput = item.querySelector('.event-estimated');
                if (actualInput && estimatedInput) {
                    const actual = parseFloat(actualInput.value) || 0;
                    const estimated = parseFloat(estimatedInput.value) || 0;
                    // Use actual if it's greater than 0, otherwise use estimated
                    societyEvents += actual > 0 ? actual : estimated;
                }
            });

            const societyMerch = parseFloat(document.getElementById('society-merch').value) || 0;
            const societyTotal = societyMemberships + societyEvents + societyMerch;

            document.getElementById('society-total').textContent = formatCurrency(societyTotal);
            document.getElementById('society-mrr').textContent = formatCurrency(societyTotal);
            document.getElementById('society-members').textContent = societyMembers.toLocaleString();

            // Labs
            const consultingRate = parseFloat(document.getElementById('price-consulting').value) || 0;
            const labsConsulting = (parseFloat(document.getElementById('labs-consulting-hours').value) || 0) * consultingRate;

            // Calculate total from all individual projects
            let labsProjects = 0;
            let projectCount = 0;
            document.querySelectorAll('.project-value').forEach(input => {
                const value = parseFloat(input.value) || 0;
                labsProjects += value;
                if (value > 0) projectCount++;
            });

            // Calculate total from all individual grants/partnerships
            let labsGrants = 0;
            let grantCount = 0;
            document.querySelectorAll('#labs-grant-list .course-item').forEach(item => {
                const value = parseFloat(item.querySelector('.grant-value')?.value) || 0;
                const type = item.querySelector('.grant-type')?.value || 'monthly';

                let monthlyValue = value;
                if (type === 'annual') {
                    monthlyValue = value / 12;
                } else if (type === 'project') {
                    // For per-project grants, amortize over 12 months
                    monthlyValue = value / 12;
                }

                labsGrants += monthlyValue;
                if (value > 0) grantCount++;
            });

            const labsTotal = labsConsulting + labsProjects + labsGrants;

            document.getElementById('labs-total').textContent = formatCurrency(labsTotal);
            document.getElementById('labs-mrr').textContent = formatCurrency(labsTotal);
            document.getElementById('labs-projects-count').textContent = projectCount;
            document.getElementById('labs-grants-count').textContent = grantCount;

            // Academy
            let academyCourses = 0;
            let totalCourseStudents = 0;
            document.querySelectorAll('#course-list .course-item').forEach(item => {
                const priceInput = item.querySelector('.course-price');
                const salesInput = item.querySelector('.course-sales');
                if (priceInput && salesInput) {
                    const price = parseFloat(priceInput.value) || 0;
                    const sales = parseFloat(salesInput.value) || 0;
                    academyCourses += price * sales;
                    totalCourseStudents += sales;
                }
            });
            const certPrice = parseFloat(document.getElementById('price-cert').value) || 0;
            const academyCerts = (parseFloat(document.getElementById('academy-certs').value) || 0) * certPrice;
            const workshopPrice = parseFloat(document.getElementById('price-workshop').value) || 0;
            const academyWorkshops = (parseFloat(document.getElementById('academy-workshops').value) || 0) * workshopPrice;

            // Mentorship revenue calculation
            const mentorshipPrice = parseFloat(document.getElementById('mentorship-price')?.value) || 0;
            const mentorshipCount = parseFloat(document.getElementById('mentorship-count')?.value) || 0;
            const platformFee = parseFloat(document.getElementById('mentorship-split')?.value) || 30;

            const mentorshipGross = mentorshipPrice * mentorshipCount;
            const mentorshipNet = (mentorshipGross * platformFee) / 100;

            // Update mentorship display
            if (document.getElementById('platform-share')) {
                document.getElementById('platform-share').textContent = formatCurrency(mentorshipNet);
            }
            if (document.getElementById('mentor-share')) {
                document.getElementById('mentor-share').textContent = formatCurrency(mentorshipGross - mentorshipNet);
            }

            const academyTotal = academyCourses + academyCerts + academyWorkshops + mentorshipNet;

            document.getElementById('academy-total').textContent = formatCurrency(academyTotal);
            document.getElementById('academy-mrr').textContent = formatCurrency(academyTotal);
            document.getElementById('academy-students').textContent = (
                totalCourseStudents +
                (parseFloat(document.getElementById('academy-certs').value) || 0) +
                (parseFloat(document.getElementById('academy-workshops').value) || 0)
            );

            // Dojos
            const dojoMemberPrice = parseFloat(document.getElementById('price-dojo-membership').value) || 0;
            const dojosMemberships = (parseFloat(document.getElementById('dojos-memberships').value) || 0) * dojoMemberPrice;
            const xrSessionPrice = parseFloat(document.getElementById('price-xr-session').value) || 0;
            const dojosXR = (parseFloat(document.getElementById('dojos-xr-sessions').value) || 0) * xrSessionPrice;
            const trainingPrice = parseFloat(document.getElementById('price-training').value) || 0;
            const dojosTraining = (parseFloat(document.getElementById('dojos-training').value) || 0) * trainingPrice;
            const dojosTotal = dojosMemberships + dojosXR + dojosTraining;

            document.getElementById('dojos-total').textContent = formatCurrency(dojosTotal);
            document.getElementById('dojos-mrr').textContent = formatCurrency(dojosTotal);
            document.getElementById('dojos-sessions').textContent = document.getElementById('dojos-xr-sessions').value;

            // Total MRR
            const totalMRR = societyTotal + labsTotal + academyTotal + dojosTotal;
            document.getElementById('total-mrr').textContent = formatCurrency(totalMRR);

            // Update CAC/LTV table
            updateCACLTVTable();

            // Sync CAC values to One-Pager
            if (typeof syncCACToOnePager === 'function') {
                syncCACToOnePager();
            }

            return totalMRR;
        }

        // ============================================
        // CAC/LTV ANALYSIS
        // ============================================

        /**
         * Calculates Lifetime Value for each revenue branch
         *
         * Formulas:
         * - Society: Avg monthly membership × retention months
         * - Labs: Project value × repeat client rate
         * - Academy: Course revenue × student lifecycle
         * - Dojos: Membership price × avg retention
         */
        function calculateLTV(branch) {
            switch (branch) {
                case 'society':
                    const avgMembership = 15; // Average across tiers
                    const retentionMonths = 36; // 3-year avg
                    return avgMembership * retentionMonths;

                case 'labs':
                    const avgProjectValue = 5000;
                    const repeatRate = 3; // 3 projects per client
                    return avgProjectValue * repeatRate;

                case 'academy':
                    const avgCourseValue = 150;
                    const coursesPerStudent = 3;
                    return avgCourseValue * coursesPerStudent;

                case 'dojos':
                    const avgDojo = 60;
                    const dojoRetention = 30; // months
                    return avgDojo * dojoRetention;

                default:
                    return 0;
            }
        }

        /**
         * Updates the CAC & LTV Analysis table with live calculations
         */
        function updateCACLTVTable() {
            const branches = ['society', 'labs', 'academy', 'dojos'];

            branches.forEach(branch => {
                const cacInput = document.getElementById(`${branch}-cac`);
                const cac = parseFloat(cacInput?.value) || 0;
                const ltv = calculateLTV(branch);
                const ratio = cac > 0 ? ltv / cac : 0;
                const paybackMonths = ltv > 0 ? cac / (ltv / 12) : 0;

                // Update table cells
                const cacCell = document.getElementById(`cac-${branch}`);
                const ltvCell = document.getElementById(`ltv-${branch}`);
                const ratioCell = document.getElementById(`ratio-${branch}`);
                const paybackCell = document.getElementById(`payback-${branch}`);
                const statusCell = document.getElementById(`status-${branch}`);

                if (cacCell) cacCell.textContent = formatCurrency(cac);
                if (ltvCell) ltvCell.textContent = formatCurrency(ltv);
                if (ratioCell) ratioCell.textContent = ratio.toFixed(1) + ':1';
                if (paybackCell) paybackCell.textContent = paybackMonths.toFixed(1) + ' mo';

                // Status badge logic
                if (statusCell) {
                    if (ratio >= 6) {
                        statusCell.innerHTML = '<span class="status-badge success">Excellent</span>';
                    } else if (ratio >= 3) {
                        statusCell.innerHTML = '<span class="status-badge success">Good</span>';
                    } else if (ratio > 0) {
                        statusCell.innerHTML = '<span class="status-badge warning">Review</span>';
                    } else {
                        statusCell.innerHTML = '<span class="status-badge">N/A</span>';
                    }
                }
            });

            // Update dashboard LTV:CAC ratio with blended average
            const blendedRatio = calculateBlendedLTVCAC();
            if (document.getElementById('ltv-cac-ratio')) {
                document.getElementById('ltv-cac-ratio').textContent = blendedRatio.toFixed(1) + ':1';
            }
            if (document.getElementById('ltv-cac-status')) {
                if (blendedRatio >= 6) {
                    document.getElementById('ltv-cac-status').className = 'metric-change positive';
                    document.getElementById('ltv-cac-status').textContent = 'Excellent';
                } else if (blendedRatio >= 3) {
                    document.getElementById('ltv-cac-status').className = 'metric-change positive';
                    document.getElementById('ltv-cac-status').textContent = 'Good';
                } else {
                    document.getElementById('ltv-cac-status').className = 'metric-change negative';
                    document.getElementById('ltv-cac-status').textContent = 'Needs improvement';
                }
            }
        }

        /**
         * Calculates blended LTV:CAC ratio across all branches
         */
        function calculateBlendedLTVCAC() {
            const branches = ['society', 'labs', 'academy', 'dojos'];
            let totalLTV = 0;
            let totalCAC = 0;
            let count = 0;

            branches.forEach(branch => {
                const cacInput = document.getElementById(`${branch}-cac`);
                const cac = parseFloat(cacInput?.value) || 0;
                const ltv = calculateLTV(branch);

                if (cac > 0 && ltv > 0) {
                    totalLTV += ltv;
                    totalCAC += cac;
                    count++;
                }
            });

            return count > 0 ? totalLTV / totalCAC : 0;
        }

        // ============================================
        // CASH ON HAND SYNCHRONIZATION
        // ============================================

        /**
         * CASH ON HAND SYNCHRONIZATION
         * =============================
         * Ensures cash value is consistent across Operations and Capital Raise tabs
         *
         * Connected Elements:
         * - cash-slider (Operations): Range input
         * - cash-input-ops (Operations): Number input
         * - current-cash (Capital Raise): Number input
         */
        function syncCashOnHand() {
            const slider = document.getElementById('cash-slider');
            const opsInput = document.getElementById('cash-input-ops');
            const capitalInput = document.getElementById('current-cash');

            if (!slider || !opsInput || !capitalInput) return;

            // Sync all three elements
            const value = parseFloat(slider.value) || 0;
            opsInput.value = value;
            capitalInput.value = value;

            // Update display
            document.getElementById('cash-display').textContent = formatCurrency(value);

            // Trigger dependent calculations
            updateOperationsCalcs();
            updateCapitalCalcs();
        }

        // ============================================
        // OPERATIONS CALCULATIONS
        // ============================================

        function updateOperationsCalcs() {
            let fixedTotal = 0;
            document.querySelectorAll('.fixed-cost-value').forEach(input => {
                fixedTotal += parseFloat(input.value) || 0;
            });

            let variableTotal = 0;
            document.querySelectorAll('.variable-cost-value').forEach(input => {
                variableTotal += parseFloat(input.value) || 0;
            });

            const monthlyBurn = fixedTotal + variableTotal;
            const currentCash = parseFloat(document.getElementById('cash-slider').value) || 0;
            const runway = monthlyBurn > 0 ? currentCash / monthlyBurn : 0;
            const need18mo = monthlyBurn * 18;

            document.getElementById('total-fixed').textContent = formatCurrency(fixedTotal);
            document.getElementById('total-variable').textContent = formatCurrency(variableTotal);
            document.getElementById('ops-burn').textContent = formatCurrency(monthlyBurn);
            document.getElementById('ops-annual').textContent = formatCurrency(monthlyBurn * 12);
            document.getElementById('ops-runway').textContent = runway.toFixed(1) + ' mo';
            document.getElementById('ops-need').textContent = formatCurrency(need18mo);
            document.getElementById('cash-display').textContent = formatCurrency(currentCash);

            const progress = Math.min((runway / 18) * 100, 100);
            document.getElementById('runway-progress').style.width = progress + '%';

            document.getElementById('monthly-burn').value = monthlyBurn;
            document.getElementById('current-cash').value = currentCash;

            // Update connected values (but don't call updateCapitalCalcs to avoid infinite loop)
            updateAllConnectedValues();
        }

        // ============================================
        // PROJECTION CHART
        // ============================================

        function updateProjectionChart(scenario) {
            const growthRates = {
                conservative: 0.08,
                moderate: 0.12,
                aggressive: 0.20
            };

            const rateLabels = {
                conservative: '8%',
                moderate: '12%',
                aggressive: '20%'
            };

            const rate = growthRates[scenario];
            const startMRR = updateRevenueCalcs();

            const quarters = ['Q1 Y1', 'Q2 Y1', 'Q3 Y1', 'Q4 Y1', 'Q1 Y2', 'Q2 Y2', 'Q3 Y2', 'Q4 Y2', 'Q1 Y3', 'Q2 Y3', 'Q3 Y3', 'Q4 Y3'];

            let chartHTML = '';
            let maxRevenue = 0;
            const revenues = [];

            // Calculate revenues
            quarters.forEach((q, i) => {
                const monthsElapsed = (i + 1) * 3;
                const quarterlyGrowth = Math.pow(1 + rate, monthsElapsed / 12);
                const revenue = startMRR * 3 * quarterlyGrowth;
                revenues.push(revenue);
                if (revenue > maxRevenue) maxRevenue = revenue;
            });

            // Update summary metrics
            const endMRR = revenues[revenues.length - 1] / 3;
            const totalARR = endMRR * 12;
            document.getElementById('projection-start-mrr').textContent = formatCurrencyShort(startMRR);
            document.getElementById('projection-end-mrr').textContent = formatCurrencyShort(endMRR);
            document.getElementById('projection-total-arr').textContent = formatCurrencyShort(totalARR);
            document.getElementById('projection-growth-rate').textContent = rateLabels[scenario] + ' MoM';

            // Generate Y-axis values
            const yAxisSteps = 5;
            let yAxisHTML = '';
            for (let i = yAxisSteps; i >= 0; i--) {
                const value = (maxRevenue / yAxisSteps) * i;
                yAxisHTML += `<div>${formatCurrencyShort(value)}</div>`;
            }
            document.getElementById('y-axis-values').innerHTML = yAxisHTML;

            // Generate chart bars with value labels
            quarters.forEach((q, i) => {
                const height = (revenues[i] / maxRevenue) * 200;
                chartHTML += `
                    <div class="chart-bar-group">
                        <div class="chart-bar" style="height: ${height}px;" title="${formatCurrencyShort(revenues[i])}">
                            <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 0.65rem; color: var(--accent-cyan); font-family: 'JetBrains Mono', monospace; white-space: nowrap;">${formatCurrencyShort(revenues[i])}</div>
                        </div>
                        <div class="chart-bar-label">${q}</div>
                    </div>
                `;
            });

            document.getElementById('projection-chart').innerHTML = chartHTML;

            // Generate quarterly breakdown table
            let tableHTML = '';
            quarters.forEach((q, i) => {
                const year = Math.ceil((i + 1) / 4);
                tableHTML += `
                    <div style="padding: 1rem; background: var(--bg-card); border-radius: 8px; border: 1px solid var(--border);">
                        <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.5rem;">${q}</div>
                        <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.1rem; color: var(--accent-cyan); margin-bottom: 0.25rem;">${formatCurrencyShort(revenues[i])}</div>
                        <div style="font-size: 0.65rem; color: var(--text-secondary);">Revenue</div>
                    </div>
                `;
            });
            document.getElementById('projection-table-view').innerHTML = tableHTML;
        }

        // ============================================
        // EVENT LISTENERS
        // ============================================
        // NOTE: All event listeners have been moved to the consolidated DOMContentLoaded handler above

        function handleRevenueInput() {
            updateRevenueCalcs();
            updateProjectionChart(document.querySelector('.scenario-pill.active').dataset.scenario);
        }

        function attachRevenueListeners() {
            document.querySelectorAll('.society-member, #society-lifetime, #society-merch').forEach(input => {
                input.removeEventListener('input', handleRevenueInput);
                input.addEventListener('input', handleRevenueInput);
            });
            document.querySelectorAll('.event-name, .event-estimated, .event-actual').forEach(input => {
                input.removeEventListener('input', handleRevenueInput);
                input.addEventListener('input', handleRevenueInput);
            });
            document.querySelectorAll('#price-cybernaut, #price-reality-hacker, #price-reality-weaver, #price-lifetime').forEach(input => {
                input.removeEventListener('input', handleRevenueInput);
                input.addEventListener('input', handleRevenueInput);
            });
            document.querySelectorAll('#price-consulting, #labs-consulting-hours').forEach(input => {
                input.removeEventListener('input', handleRevenueInput);
                input.addEventListener('input', handleRevenueInput);
            });
            document.querySelectorAll('.project-name, .project-value, .project-type, .grant-name, .grant-value, .grant-type').forEach(input => {
                input.removeEventListener('input', handleRevenueInput);
                input.addEventListener('input', handleRevenueInput);
                input.removeEventListener('change', handleRevenueInput);
                input.addEventListener('change', handleRevenueInput);
            });
            document.querySelectorAll('#price-cert, #academy-certs, #price-workshop, #academy-workshops').forEach(input => {
                input.removeEventListener('input', handleRevenueInput);
                input.addEventListener('input', handleRevenueInput);
            });
            document.querySelectorAll('#mentorship-price, #mentorship-count, #mentorship-split').forEach(input => {
                input.removeEventListener('input', handleRevenueInput);
                input.addEventListener('input', handleRevenueInput);
            });
            document.querySelectorAll('.course-price, .course-sales').forEach(input => {
                input.removeEventListener('input', handleRevenueInput);
                input.addEventListener('input', handleRevenueInput);
            });
            document.querySelectorAll('#price-dojo-membership, #dojos-memberships, #price-xr-session, #dojos-xr-sessions, #price-training, #dojos-training').forEach(input => {
                input.removeEventListener('input', handleRevenueInput);
                input.addEventListener('input', handleRevenueInput);
            });
            document.querySelectorAll('#society-cac, #labs-cac, #academy-cac, #dojos-cac').forEach(input => {
                input.removeEventListener('input', handleRevenueInput);
                input.addEventListener('input', handleRevenueInput);
                // Also sync CAC values to One-Pager when changed
                input.addEventListener('input', function () {
                    if (typeof syncCACToOnePager === 'function') {
                        syncCACToOnePager();
                    }
                });
            });
        }

        // Event management (for Society)
        let eventIdCounter = 2;

        function addEvent() {
            const eventList = document.getElementById('society-events-list');
            const newEvent = document.createElement('div');
            newEvent.className = 'event-item';
            newEvent.dataset.eventId = eventIdCounter++;
            newEvent.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 0.5fr; gap: 0.5rem; align-items: center;';
            newEvent.innerHTML = `
                <input type="text" class="input-field event-name" value="New Event" placeholder="Event name">
                <input type="number" class="input-field event-estimated" value="0" placeholder="Estimated $">
                <input type="number" class="input-field event-actual" value="0" placeholder="Actual $">
                <button class="btn-icon remove-event" title="Remove">&#10005;</button>
            `;
            eventList.appendChild(newEvent);
            attachRevenueListeners();
            attachEventRemoveListeners();
            handleRevenueInput();
        }

        function removeEvent(e) {
            const eventItem = e.target.closest('.event-item');
            if (document.querySelectorAll('#society-events-list .event-item').length > 1) {
                eventItem.remove();
                handleRevenueInput();
            }
        }

        function attachEventRemoveListeners() {
            document.querySelectorAll('.remove-event').forEach(btn => {
                btn.removeEventListener('click', removeEvent);
                btn.addEventListener('click', removeEvent);
            });
        }

        document.getElementById('add-event').addEventListener('click', addEvent);
        attachEventRemoveListeners();

        // Fixed Cost management
        let fixedCostIdCounter = 8;

        function addFixedCost() {
            const costList = document.getElementById('fixed-costs-list');
            const newCost = document.createElement('div');
            newCost.className = 'cost-item';
            newCost.dataset.costId = fixedCostIdCounter++;
            newCost.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 0.5fr; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;';
            newCost.innerHTML = `
                <input type="text" class="input-field fixed-cost-name" value="New Cost" placeholder="Cost name">
                <input type="number" class="input-field fixed-cost-value" value="0" placeholder="$">
                <button class="btn-icon remove-fixed-cost" title="Remove">&#10005;</button>
            `;
            costList.appendChild(newCost);
            attachFixedCostListeners();
            attachFixedCostRemoveListeners();
            updateOperationsCalcs();
        }

        function removeFixedCost(e) {
            const costItem = e.target.closest('.cost-item');
            if (document.querySelectorAll('#fixed-costs-list .cost-item').length > 1) {
                costItem.remove();
                updateOperationsCalcs();
            }
        }

        function attachFixedCostListeners() {
            document.querySelectorAll('.fixed-cost-name, .fixed-cost-value').forEach(input => {
                input.removeEventListener('input', updateOperationsCalcs);
                input.addEventListener('input', updateOperationsCalcs);
            });
        }

        function attachFixedCostRemoveListeners() {
            document.querySelectorAll('.remove-fixed-cost').forEach(btn => {
                btn.removeEventListener('click', removeFixedCost);
                btn.addEventListener('click', removeFixedCost);
            });
        }

        document.getElementById('add-fixed-cost').addEventListener('click', addFixedCost);
        attachFixedCostListeners();
        attachFixedCostRemoveListeners();

        // Variable Cost management
        let variableCostIdCounter = 6;

        function addVariableCost() {
            const costList = document.getElementById('variable-costs-list');
            const newCost = document.createElement('div');
            newCost.className = 'cost-item';
            newCost.dataset.costId = variableCostIdCounter++;
            newCost.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 0.5fr; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;';
            newCost.innerHTML = `
                <input type="text" class="input-field variable-cost-name" value="New Cost" placeholder="Cost name">
                <input type="number" class="input-field variable-cost-value" value="0" placeholder="$">
                <button class="btn-icon remove-variable-cost" title="Remove">&#10005;</button>
            `;
            costList.appendChild(newCost);
            attachVariableCostListeners();
            attachVariableCostRemoveListeners();
            updateOperationsCalcs();
        }

        function removeVariableCost(e) {
            const costItem = e.target.closest('.cost-item');
            if (document.querySelectorAll('#variable-costs-list .cost-item').length > 1) {
                costItem.remove();
                updateOperationsCalcs();
            }
        }

        function attachVariableCostListeners() {
            document.querySelectorAll('.variable-cost-name, .variable-cost-value').forEach(input => {
                input.removeEventListener('input', updateOperationsCalcs);
                input.addEventListener('input', updateOperationsCalcs);
            });
        }

        function attachVariableCostRemoveListeners() {
            document.querySelectorAll('.remove-variable-cost').forEach(btn => {
                btn.removeEventListener('click', removeVariableCost);
                btn.addEventListener('click', removeVariableCost);
            });
        }

        document.getElementById('add-variable-cost').addEventListener('click', addVariableCost);
        attachVariableCostListeners();
        attachVariableCostRemoveListeners();

        // Course management
        let courseIdCounter = 4;

        function addCourse() {
            const courseList = document.getElementById('course-list');
            const newCourse = document.createElement('div');
            newCourse.className = 'course-item';
            newCourse.dataset.courseId = courseIdCounter++;
            newCourse.innerHTML = `
                <input type="text" class="input-field course-name" value="New Course" placeholder="Course name">
                <input type="number" class="input-field course-price" value="199" placeholder="$">
                <input type="number" class="input-field course-sales" value="0" placeholder="Qty">
                <button class="btn-icon remove-course" title="Remove">&#10005;</button>
            `;
            courseList.appendChild(newCourse);
            attachRevenueListeners();
            attachCourseRemoveListeners();
            handleRevenueInput();
        }

        function removeCourse(e) {
            const courseItem = e.target.closest('.course-item');
            if (document.querySelectorAll('#course-list .course-item').length > 1) {
                courseItem.remove();
                handleRevenueInput();
            }
        }

        function attachCourseRemoveListeners() {
            document.querySelectorAll('.remove-course').forEach(btn => {
                btn.removeEventListener('click', removeCourse);
                btn.addEventListener('click', removeCourse);
            });
        }

        document.getElementById('add-course').addEventListener('click', addCourse);

        // Project management (for Labs)
        let projectIdCounter = 3;

        function addProject() {
            const projectList = document.getElementById('labs-project-list');
            const newProject = document.createElement('div');
            newProject.className = 'course-item';
            newProject.dataset.projectId = projectIdCounter++;
            newProject.style.cssText = 'display: grid; grid-template-columns: 2fr 1.5fr 1fr 0.5fr; gap: 0.5rem; align-items: center;';
            newProject.innerHTML = `
                <input type="text" class="input-field project-name" value="New Project" placeholder="Project name">
                <input type="number" class="input-field project-value" value="0" placeholder="$">
                <select class="input-field project-type" style="padding: 0.65rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary);">
                    <option value="monthly">Monthly</option>
                    <option value="project">Per Project</option>
                </select>
                <button class="btn-icon remove-project" title="Remove">&#10005;</button>
            `;
            projectList.appendChild(newProject);
            attachRevenueListeners();
            attachProjectRemoveListeners();
            handleRevenueInput();
        }

        function removeProject(e) {
            const projectItem = e.target.closest('.course-item');
            if (document.querySelectorAll('#labs-project-list .course-item').length > 1) {
                projectItem.remove();
                handleRevenueInput();
            }
        }

        function attachProjectRemoveListeners() {
            document.querySelectorAll('.remove-project').forEach(btn => {
                btn.removeEventListener('click', removeProject);
                btn.addEventListener('click', removeProject);
            });
        }

        document.getElementById('add-project').addEventListener('click', addProject);
        attachProjectRemoveListeners();

        // Grant management (for Labs)
        let grantIdCounter = 3;

        function addGrant() {
            const grantList = document.getElementById('labs-grant-list');
            const newGrant = document.createElement('div');
            newGrant.className = 'course-item';
            newGrant.dataset.grantId = grantIdCounter++;
            newGrant.style.cssText = 'display: grid; grid-template-columns: 2fr 1.5fr 1fr 0.5fr; gap: 0.5rem; align-items: center;';
            newGrant.innerHTML = `
                <input type="text" class="input-field grant-name" value="New Grant/Partnership" placeholder="Grant/partner name">
                <input type="number" class="input-field grant-value" value="0" placeholder="$">
                <select class="input-field grant-type" style="padding: 0.65rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; color: var(--text-primary);">
                    <option value="monthly">Monthly</option>
                    <option value="project">Per Project</option>
                    <option value="annual">Annual (÷12)</option>
                </select>
                <button class="btn-icon remove-grant" title="Remove">&#10005;</button>
            `;
            grantList.appendChild(newGrant);
            attachRevenueListeners();
            attachGrantRemoveListeners();
            handleRevenueInput();
        }

        function removeGrant(e) {
            const grantItem = e.target.closest('.course-item');
            if (document.querySelectorAll('#labs-grant-list .course-item').length > 1) {
                grantItem.remove();
                handleRevenueInput();
            }
        }

        function attachGrantRemoveListeners() {
            document.querySelectorAll('.remove-grant').forEach(btn => {
                btn.removeEventListener('click', removeGrant);
                btn.addEventListener('click', removeGrant);
            });
        }

        document.getElementById('add-grant').addEventListener('click', addGrant);
        attachGrantRemoveListeners();


        // ============================================
        // HELPER FUNCTIONS
        // ============================================

        function parseCurrencyValue(text) {
            if (!text) return 0;
            text = text.trim();
            const multiplier = text.includes('M') ? 1000000 : text.includes('K') ? 1000 : 1;
            const value = parseFloat(text.replace(/[$,KM]/g, '')) || 0;
            return value * multiplier;
        }

        // ============================================
        // TOOLTIP & HELP ICON SYSTEM
        // ============================================

        /**
         * Creates a help icon element with tooltip functionality
         * @param {string} tooltipText - The help text to display
         * @param {string} position - Tooltip position: 'top' or 'bottom' (default: 'top')
         * @returns {HTMLElement} The tooltip container element
         */
        function createHelpIcon(tooltipText, position = 'top') {
            const container = document.createElement('span');
            container.className = 'tooltip-container';

            const icon = document.createElement('span');
            icon.className = 'help-icon';
            icon.innerHTML = '?';
            icon.setAttribute('data-tooltip', tooltipText);

            const tooltip = document.createElement('div');
            tooltip.className = `tooltip ${position}`;
            tooltip.textContent = tooltipText;

            // Show/hide tooltip on hover
            icon.addEventListener('mouseenter', () => tooltip.classList.add('active'));
            icon.addEventListener('mouseleave', () => tooltip.classList.remove('active'));

            // Mobile: show on click
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                tooltip.classList.toggle('active');
            });

            container.appendChild(icon);
            container.appendChild(tooltip);
            return container;
        }

        /**
         * Adds tooltips to existing help icons with data-tooltip attributes
         * Call this after DOM is loaded or after dynamically adding help icons
         */
        function initializeTooltips() {
            document.querySelectorAll('[data-tooltip]').forEach(element => {
                if (element.classList.contains('help-icon') || element.classList.contains('help-icon-inline')) {
                    // Already has tooltip setup, skip
                    if (element.parentElement.classList.contains('tooltip-container')) return;

                    const tooltipText = element.getAttribute('data-tooltip');
                    const position = element.getAttribute('data-tooltip-position') || 'top';

                    // Wrap in container if not already
                    const container = document.createElement('span');
                    container.className = 'tooltip-container';

                    element.parentNode.insertBefore(container, element);
                    container.appendChild(element);

                    // Create tooltip div
                    const tooltip = document.createElement('div');
                    tooltip.className = `tooltip ${position}`;
                    tooltip.textContent = tooltipText;

                    // Show/hide on hover
                    element.addEventListener('mouseenter', () => tooltip.classList.add('active'));
                    element.addEventListener('mouseleave', () => tooltip.classList.remove('active'));

                    // Mobile: toggle on click
                    element.addEventListener('click', (e) => {
                        e.stopPropagation();
                        tooltip.classList.toggle('active');
                    });

                    container.appendChild(tooltip);
                }
            });

            // Close tooltips when clicking outside
            document.addEventListener('click', () => {
                document.querySelectorAll('.tooltip.active').forEach(tooltip => {
                    tooltip.classList.remove('active');
                });
            });
        }

        // ============================================
        // LOCALSTORAGE SAVE/LOAD MECHANISM
        // ============================================

        function saveAllData() {
            const data = {
                // Revenue tab inputs
                revenueInputs: {},
                // Capital tab inputs
                capitalInputs: {},
                // Operations tab inputs
                operationsInputs: {},
                // Business Plan 3-Year Revenue Projections (editable cells)
                revenueProjections: {},
                // All contenteditable fields
                editableText: {},
                // Timestamp
                lastSaved: new Date().toISOString()
            };

            // Save all input fields by ID
            document.querySelectorAll('input[type="number"], input[type="text"], input[type="range"]').forEach(input => {
                if (input.id) {
                    data.revenueInputs[input.id] = input.value;
                }
            });

            // Save editable revenue input fields
            document.querySelectorAll('.editable-revenue').forEach(input => {
                const year = input.dataset.year;
                const stream = input.dataset.stream;
                if (year && stream) {
                    data.revenueProjections[`${stream}-year${year}`] = input.value;
                }
            });

            // Save all contenteditable text fields
            document.querySelectorAll('[contenteditable="true"]').forEach(element => {
                if (element.id) {
                    data.editableText[element.id] = element.textContent || element.innerHTML;
                } else {
                    // Create a unique identifier for elements without IDs
                    const identifier = element.className + '-' + Array.from(element.parentNode.children).indexOf(element);
                    data.editableText[identifier] = element.textContent || element.innerHTML;
                }
            });

            // Save courses
            const courses = [];
            document.querySelectorAll('#course-list .course-item').forEach(courseItem => {
                courses.push({
                    name: courseItem.querySelector('.course-name')?.value || '',
                    price: courseItem.querySelector('.course-price')?.value || '',
                    sales: courseItem.querySelector('.course-sales')?.value || ''
                });
            });
            data.courses = courses;

            // Save labs projects
            const projects = [];
            document.querySelectorAll('#labs-project-list .course-item').forEach(projectItem => {
                projects.push({
                    name: projectItem.querySelector('.project-name')?.value || '',
                    value: projectItem.querySelector('.project-value')?.value || '',
                    type: projectItem.querySelector('.project-type')?.value || 'monthly'
                });
            });
            data.projects = projects;

            // Save labs grants/partnerships
            const grants = [];
            document.querySelectorAll('#labs-grant-list .course-item').forEach(grantItem => {
                grants.push({
                    name: grantItem.querySelector('.grant-name')?.value || '',
                    value: grantItem.querySelector('.grant-value')?.value || ''
                });
            });
            data.grants = grants;

            // Save society events
            const events = [];
            document.querySelectorAll('#society-events-list .event-item').forEach(eventItem => {
                events.push({
                    name: eventItem.querySelector('.event-name').value,
                    estimated: eventItem.querySelector('.event-estimated').value,
                    actual: eventItem.querySelector('.event-actual').value
                });
            });
            data.events = events;

            // Save fixed costs
            const fixedCosts = [];
            document.querySelectorAll('#fixed-costs-list .cost-item').forEach(costItem => {
                fixedCosts.push({
                    name: costItem.querySelector('.fixed-cost-name').value,
                    value: costItem.querySelector('.fixed-cost-value').value
                });
            });
            data.fixedCosts = fixedCosts;

            // Save variable costs
            const variableCosts = [];
            document.querySelectorAll('#variable-costs-list .cost-item').forEach(costItem => {
                variableCosts.push({
                    name: costItem.querySelector('.variable-cost-name').value,
                    value: costItem.querySelector('.variable-cost-value').value
                });
            });
            data.variableCosts = variableCosts;

            localStorage.setItem('cyberdelicCFOData', JSON.stringify(data));
            console.log('Data saved at', data.lastSaved);
        }

        function loadAllData() {
            const savedData = localStorage.getItem('cyberdelicCFOData');
            if (!savedData) return false;

            try {
                const data = JSON.parse(savedData);

                // Restore all input fields
                Object.keys(data.revenueInputs || {}).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = data.revenueInputs[id];
                    }
                });

                // Restore editable revenue input fields
                Object.keys(data.revenueProjections || {}).forEach(key => {
                    const [stream, yearPart] = key.split('-year');
                    const input = document.querySelector(`.editable-revenue[data-year="${yearPart}"][data-stream="${stream}"]`);
                    if (input) {
                        input.value = data.revenueProjections[key];
                    }
                });

                // Restore contenteditable text fields
                Object.keys(data.editableText || {}).forEach(identifier => {
                    const element = document.getElementById(identifier);
                    if (element) {
                        element.textContent = data.editableText[identifier];
                    }
                });

                // Restore courses
                if (data.courses && data.courses.length > 0) {
                    const courseList = document.getElementById('course-list');
                    // Clear existing courses except the first template
                    const courseItems = courseList.querySelectorAll('.course-item');
                    for (let i = 1; i < courseItems.length; i++) {
                        courseItems[i].remove();
                    }

                    // Add saved courses
                    data.courses.forEach((course, index) => {
                        if (index === 0) {
                            // Update first course
                            const firstCourse = courseList.querySelector('.course-item');
                            if (firstCourse) {
                                firstCourse.querySelector('.course-name').value = course.name;
                                firstCourse.querySelector('.course-price').value = course.price;
                                firstCourse.querySelector('.course-sales').value = course.sales;
                            }
                        } else {
                            // Add new courses
                            addCourse();
                            const lastCourse = courseList.querySelector('.course-item:last-child');
                            if (lastCourse) {
                                lastCourse.querySelector('.course-name').value = course.name;
                                lastCourse.querySelector('.course-price').value = course.price;
                                lastCourse.querySelector('.course-sales').value = course.sales;
                            }
                        }
                    });
                }

                // Restore labs projects
                if (data.projects && data.projects.length > 0) {
                    const projectList = document.getElementById('labs-project-list');
                    // Clear existing projects except the first template
                    const projectItems = projectList.querySelectorAll('.course-item');
                    for (let i = 1; i < projectItems.length; i++) {
                        projectItems[i].remove();
                    }

                    // Add saved projects
                    data.projects.forEach((project, index) => {
                        if (index === 0) {
                            // Update first project
                            const firstProject = projectList.querySelector('.course-item');
                            if (firstProject) {
                                firstProject.querySelector('.project-name').value = project.name;
                                firstProject.querySelector('.project-value').value = project.value;
                                if (firstProject.querySelector('.project-type')) {
                                    firstProject.querySelector('.project-type').value = project.type || 'monthly';
                                }
                            }
                        } else {
                            // Add new projects
                            addProject();
                            const lastProject = projectList.querySelector('.course-item:last-child');
                            if (lastProject) {
                                lastProject.querySelector('.project-name').value = project.name;
                                lastProject.querySelector('.project-value').value = project.value;
                                if (lastProject.querySelector('.project-type')) {
                                    lastProject.querySelector('.project-type').value = project.type || 'monthly';
                                }
                            }
                        }
                    });
                }

                // Restore labs grants/partnerships
                if (data.grants && data.grants.length > 0) {
                    const grantList = document.getElementById('labs-grant-list');
                    // Clear existing grants except the first template
                    const grantItems = grantList.querySelectorAll('.course-item');
                    for (let i = 1; i < grantItems.length; i++) {
                        grantItems[i].remove();
                    }

                    // Add saved grants
                    data.grants.forEach((grant, index) => {
                        if (index === 0) {
                            // Update first grant
                            const firstGrant = grantList.querySelector('.course-item');
                            if (firstGrant) {
                                firstGrant.querySelector('.grant-name').value = grant.name;
                                firstGrant.querySelector('.grant-value').value = grant.value;
                            }
                        } else {
                            // Add new grants
                            addGrant();
                            const lastGrant = grantList.querySelector('.course-item:last-child');
                            if (lastGrant) {
                                lastGrant.querySelector('.grant-name').value = grant.name;
                                lastGrant.querySelector('.grant-value').value = grant.value;
                            }
                        }
                    });
                }

                // Restore society events
                if (data.events && data.events.length > 0) {
                    const eventList = document.getElementById('society-events-list');
                    const eventItems = eventList.querySelectorAll('.event-item');
                    for (let i = 1; i < eventItems.length; i++) {
                        eventItems[i].remove();
                    }

                    data.events.forEach((event, index) => {
                        if (index === 0) {
                            const firstEvent = eventList.querySelector('.event-item');
                            if (firstEvent) {
                                firstEvent.querySelector('.event-name').value = event.name;
                                firstEvent.querySelector('.event-estimated').value = event.estimated;
                                firstEvent.querySelector('.event-actual').value = event.actual;
                            }
                        } else {
                            addEvent();
                            const lastEvent = eventList.querySelector('.event-item:last-child');
                            if (lastEvent) {
                                lastEvent.querySelector('.event-name').value = event.name;
                                lastEvent.querySelector('.event-estimated').value = event.estimated;
                                lastEvent.querySelector('.event-actual').value = event.actual;
                            }
                        }
                    });
                }

                // Restore fixed costs
                if (data.fixedCosts && data.fixedCosts.length > 0) {
                    const fixedCostsList = document.getElementById('fixed-costs-list');
                    fixedCostsList.innerHTML = '';
                    data.fixedCosts.forEach(cost => {
                        addFixedCost();
                        const lastCost = fixedCostsList.querySelector('.cost-item:last-child');
                        if (lastCost) {
                            lastCost.querySelector('.fixed-cost-name').value = cost.name;
                            lastCost.querySelector('.fixed-cost-value').value = cost.value;
                        }
                    });
                }

                // Restore variable costs
                if (data.variableCosts && data.variableCosts.length > 0) {
                    const variableCostsList = document.getElementById('variable-costs-list');
                    variableCostsList.innerHTML = '';
                    data.variableCosts.forEach(cost => {
                        addVariableCost();
                        const lastCost = variableCostsList.querySelector('.cost-item:last-child');
                        if (lastCost) {
                            lastCost.querySelector('.variable-cost-name').value = cost.name;
                            lastCost.querySelector('.variable-cost-value').value = cost.value;
                        }
                    });
                }

                // Recalculate all values after loading
                attachRevenueListeners();
                attachEventRemoveListeners();
                attachFixedCostListeners();
                attachFixedCostRemoveListeners();
                attachVariableCostListeners();
                attachVariableCostRemoveListeners();
                handleRevenueInput();
                updateCapitalCalcs();
                updateSafeEquityCalcs();
                updateOperationsCalcs();
                updateRevenueProjectionTotals();

                console.log('Data loaded from', data.lastSaved);
                return true;
            } catch (error) {
                console.error('Error loading saved data:', error);
                return false;
            }
        }

        // Auto-save every 5 seconds when there are changes
        let autoSaveTimer;
        function scheduleAutoSave() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveAllData();
            }, 5000);
        }

        // Add save listener to all inputs
        function attachAutoSaveListeners() {
            document.querySelectorAll('input, [contenteditable="true"]').forEach(element => {
                element.addEventListener('input', scheduleAutoSave);
                element.addEventListener('blur', saveAllData); // Save immediately on blur
            });
        }

        // Manual save button functionality (we'll add a button for this)
        function createSaveButton() {
            const saveBtn = document.createElement('button');
            saveBtn.id = 'save-progress-btn';
            saveBtn.textContent = '💾 Save Progress';
            saveBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #00d4ff 0%, #a855f7 100%);
                color: #0a0a0f;
                border: none;
                padding: 12px 24px;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
                z-index: 10000;
                font-family: inherit;
                font-size: 0.9rem;
                transition: all 0.2s ease;
            `;
            saveBtn.addEventListener('click', () => {
                saveAllData();
                saveBtn.textContent = '✓ Saved!';
                saveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                setTimeout(() => {
                    saveBtn.textContent = '💾 Save Progress';
                    saveBtn.style.background = 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)';
                }, 2000);
            });
            saveBtn.addEventListener('mouseenter', () => {
                saveBtn.style.transform = 'scale(1.05)';
            });
            saveBtn.addEventListener('mouseleave', () => {
                saveBtn.style.transform = 'scale(1)';
            });
            document.body.appendChild(saveBtn);
            console.log('✅ Save button created and added to page');
        }

        // ============================================
        // REVENUE PROJECTIONS TABLE SYNC
        // ============================================

        function updateRevenueProjectionTotals() {
            try {
                // Calculate totals for each year from the editable revenue input fields
                const years = [1, 2, 3];
                years.forEach(year => {
                    let total = 0;
                    document.querySelectorAll(`.editable-revenue[data-year="${year}"]`).forEach(input => {
                        const value = parseCurrencyValue(input.value) || 0;
                        total += value;
                    });
                    const totalElement = document.getElementById(`revenue-year${year}-total`);
                    if (totalElement) {
                        totalElement.textContent = formatCurrencyShort(total);
                    }
                });

                // Update all connected displays
                updateAllConnectedValues();
            } catch (error) {
                console.error('Error in updateRevenueProjectionTotals:', error);
            }
        }

        function attachRevenueProjectionListeners() {
            document.querySelectorAll('.editable-revenue').forEach(input => {
                input.addEventListener('input', function () {
                    updateRevenueProjectionTotals();
                });

                input.addEventListener('blur', function () {
                    // Clean up the value on blur
                    const value = parseCurrencyValue(this.value) || 0;
                    this.value = formatCurrencyShort(value);
                    updateRevenueProjectionTotals();
                });

                input.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.blur();
                    }
                });
            });
        }

        // ============================================
        // MASTER UPDATE FUNCTION - SYNC ALL VALUES
        // ============================================

        function updateAllConnectedValues() {
            try {
                // Get values from 3-Year Revenue Projections table (Business Plan tab)
                const year1Revenue = parseCurrencyValue(document.getElementById('revenue-year1-total')?.textContent) || 175000;
                const year2Revenue = parseCurrencyValue(document.getElementById('revenue-year2-total')?.textContent) || 600000;
                const year3Revenue = parseCurrencyValue(document.getElementById('revenue-year3-total')?.textContent) || 1500000;

                // Get MRR from Revenue tab (if available, use MRR * 12 for Year 1)
                const totalMRRElement = document.getElementById('total-mrr');
                if (totalMRRElement) {
                    const totalMRR = parseCurrencyValue(totalMRRElement.textContent) || 0;
                    // Optionally sync Year 1 with Revenue tab MRR * 12
                    // Uncomment the line below if you want Revenue tab to override Business Plan Year 1
                    // if (totalMRR > 0) year1Revenue = totalMRR * 12;
                }

                // Get values from Capital tab
                const investmentAmount = parseFloat(document.getElementById('investment-amount')?.value) || 500000;
                const safeCap = parseFloat(document.getElementById('safe-cap')?.value) || 2000000;

                // Calculate runway
                const monthlyBurn = parseFloat(document.getElementById('monthly-burn')?.value) || 27778;
                const currentCash = parseFloat(document.getElementById('current-cash')?.value) || 0;
                const runwayTarget = parseFloat(document.getElementById('runway-target')?.value) || 18;
                const currentRunway = monthlyBurn > 0 ? currentCash / monthlyBurn : 0;
                const runway = currentRunway > 0 ? currentRunway : runwayTarget;

                // Update One-Pager Financial Projections
                if (document.getElementById('onepager-year1-revenue')) {
                    document.getElementById('onepager-year1-revenue').textContent = formatCurrencyShort(year1Revenue);
                }
                if (document.getElementById('onepager-year2-revenue')) {
                    document.getElementById('onepager-year2-revenue').textContent = formatCurrencyShort(year2Revenue);
                }
                if (document.getElementById('onepager-year3-revenue')) {
                    document.getElementById('onepager-year3-revenue').textContent = formatCurrencyShort(year3Revenue);
                }

                // Update Elevator Pitch stats
                if (document.getElementById('pitch-seed-round')) {
                    document.getElementById('pitch-seed-round').textContent = formatCurrencyShort(investmentAmount);
                }
                if (document.getElementById('pitch-runway')) {
                    document.getElementById('pitch-runway').textContent = Math.round(runway) + ' mo';
                }

                // Update Elevator Pitch "The Ask" section
                if (document.getElementById('pitch-ask-amount')) {
                    document.getElementById('pitch-ask-amount').textContent = formatCurrencyShort(investmentAmount);
                }
                if (document.getElementById('pitch-safe-cap')) {
                    document.getElementById('pitch-safe-cap').textContent = formatCurrencyShort(safeCap);
                }
                if (document.getElementById('pitch-ask-runway')) {
                    document.getElementById('pitch-ask-runway').textContent = Math.round(runway) + ' months';
                }
                if (document.getElementById('pitch-year3-revenue')) {
                    document.getElementById('pitch-year3-revenue').textContent = formatCurrencyShort(year3Revenue);
                }
            } catch (error) {
                console.error('Error in updateAllConnectedValues:', error);
            }
        }

        // ============================================
        // ATTACH LISTENERS TO CAPITAL TAB INPUTS
        // ============================================

        function attachCapitalTabListeners() {
            const capitalInputs = ['investment-amount', 'safe-cap', 'monthly-burn', 'current-cash', 'runway-target'];
            capitalInputs.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.addEventListener('input', updateAllConnectedValues);
                }
            });
        }

        // ============================================
        // INITIALIZE
        // ============================================

        // Load saved data first
        const dataLoaded = loadAllData();

        attachRevenueListeners();
        attachCourseRemoveListeners();

        // Only run initial calculations if no data was loaded
        if (!dataLoaded) {
            updateCapitalCalcs();
            updateSafeEquityCalcs();
            updateRevenueCalcs();
            updateOperationsCalcs();
            updateProjectionChart('moderate');
        } else {
            // If data was loaded, recalculate everything with loaded values
            setTimeout(() => {
                updateCapitalCalcs();
                updateSafeEquityCalcs();
                updateRevenueCalcs();
                updateOperationsCalcs();
                updateProjectionChart('moderate');
            }, 50);
        }

        // Attach these listeners and update after initial calculations
        attachRevenueProjectionListeners();
        attachCapitalTabListeners();
        attachAutoSaveListeners();

        // Normalize all revenue cell formatting on load
        function normalizeRevenueCellFormatting() {
            document.querySelectorAll('.editable-revenue').forEach(cell => {
                const value = parseCurrencyValue(cell.textContent) || 0;
                cell.textContent = formatCurrencyShort(value);
            });
        }

        // ============================================
        // SAVE/LOAD BUTTON FUNCTIONALITY
        // ============================================

        const headerSaveBtn = document.getElementById('header-save-btn');
        const headerLoadBtn = document.getElementById('header-load-btn');
        const loadDropdown = document.getElementById('load-dropdown');
        const savedStatesList = document.getElementById('saved-states-list');

        // Save button - saves with timestamp
        if (headerSaveBtn) {
            headerSaveBtn.addEventListener('click', () => {
                console.log('💾 Save button clicked');
                saveTimestampedState();
            });
            console.log('✅ Save button listener attached');
        } else {
            console.error('❌ Save button not found!');
        }

        // Load button - toggles dropdown
        if (headerLoadBtn && loadDropdown) {
            headerLoadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('📂 Load button clicked');
                const isVisible = loadDropdown.style.display === 'block';
                loadDropdown.style.display = isVisible ? 'none' : 'block';
                console.log('Dropdown display set to:', loadDropdown.style.display);
                if (!isVisible) {
                    refreshSavedStatesList();
                }
            });
            console.log('✅ Load button listener attached');
        } else {
            console.error('❌ Load button or dropdown not found!', { headerLoadBtn, loadDropdown });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (headerLoadBtn && loadDropdown && !headerLoadBtn.contains(e.target) && !loadDropdown.contains(e.target)) {
                loadDropdown.style.display = 'none';
            }
        });

        function saveTimestampedState() {
            console.log('📝 Starting save process...');
            const timestamp = new Date().toISOString();
            const data = {
                revenueInputs: {},
                capitalInputs: {},
                operationsInputs: {},
                revenueProjections: {},
                editableText: {},
                courses: [],
                projects: [],
                grants: [],
                events: [],
                timestamp: timestamp
            };
            console.log('Created data structure with timestamp:', timestamp);

            // Save all input fields
            document.querySelectorAll('input[type="number"], input[type="text"], input[type="range"]').forEach(input => {
                if (input.id) {
                    data.revenueInputs[input.id] = input.value;
                }
            });

            // Save editable revenue projections
            document.querySelectorAll('.editable-revenue').forEach(input => {
                const year = input.dataset.year;
                const stream = input.dataset.stream;
                if (year && stream) {
                    data.revenueProjections[`${stream}-year${year}`] = input.value;
                }
            });

            // Save contenteditable fields
            document.querySelectorAll('[contenteditable="true"]').forEach(element => {
                if (element.id) {
                    data.editableText[element.id] = element.textContent || element.innerHTML;
                }
            });

            // Save courses
            document.querySelectorAll('#course-list .course-item').forEach(item => {
                data.courses.push({
                    name: item.querySelector('.course-name').value,
                    price: item.querySelector('.course-price').value,
                    sales: item.querySelector('.course-sales').value
                });
            });

            // Save projects
            document.querySelectorAll('#labs-project-list .course-item').forEach(item => {
                const typeSelect = item.querySelector('.project-type');
                data.projects.push({
                    name: item.querySelector('.project-name').value,
                    value: item.querySelector('.project-value').value,
                    type: typeSelect ? typeSelect.value : 'monthly'
                });
            });

            // Save grants
            document.querySelectorAll('#labs-grant-list .course-item').forEach(item => {
                data.grants.push({
                    name: item.querySelector('.grant-name').value,
                    value: item.querySelector('.grant-value').value
                });
            });

            // Save events
            document.querySelectorAll('#society-events-list .event-item').forEach(item => {
                data.events.push({
                    name: item.querySelector('.event-name').value,
                    estimated: item.querySelector('.event-estimated').value,
                    actual: item.querySelector('.event-actual').value
                });
            });

            // Get existing saved states
            const savedStates = JSON.parse(localStorage.getItem('cyberdelicCFOSavedStates') || '[]');

            // Add new state
            savedStates.push(data);

            // Keep only last 20 saves
            if (savedStates.length > 20) {
                savedStates.shift();
            }

            // Save to localStorage
            localStorage.setItem('cyberdelicCFOSavedStates', JSON.stringify(savedStates));
            console.log('✅ Saved to localStorage. Total saves:', savedStates.length);
            console.log('Saved data preview:', {
                inputsCount: Object.keys(data.revenueInputs).length,
                coursesCount: data.courses.length,
                projectsCount: data.projects.length,
                grantsCount: data.grants.length
            });

            // Also save as current state (for auto-save compatibility)
            saveAllData();

            // Show success message on Save button
            const originalText = headerSaveBtn.innerHTML;
            const originalBg = headerSaveBtn.style.background;
            headerSaveBtn.innerHTML = '✓ Saved!';
            headerSaveBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            setTimeout(() => {
                headerSaveBtn.innerHTML = originalText;
                headerSaveBtn.style.background = originalBg;
            }, 2000);

            refreshSavedStatesList();
        }

        function loadTimestampedState(timestamp) {
            console.log('📂 Loading state with timestamp:', timestamp);
            const savedStates = JSON.parse(localStorage.getItem('cyberdelicCFOSavedStates') || '[]');
            console.log('Found', savedStates.length, 'saved states');
            const state = savedStates.find(s => s.timestamp === timestamp);

            if (!state) {
                console.error('❌ State not found for timestamp:', timestamp);
                alert('State not found!');
                return;
            }
            console.log('✅ State found, restoring data...');

            // Restore all input fields
            Object.keys(state.revenueInputs || {}).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = state.revenueInputs[id];
                }
            });

            // Restore editable revenue projections
            Object.keys(state.revenueProjections || {}).forEach(key => {
                const [stream, yearPart] = key.split('-year');
                const input = document.querySelector(`.editable-revenue[data-year="${yearPart}"][data-stream="${stream}"]`);
                if (input) {
                    input.value = state.revenueProjections[key];
                }
            });

            // Restore contenteditable fields
            Object.keys(state.editableText || {}).forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = state.editableText[id];
                }
            });

            // Restore courses
            if (state.courses && state.courses.length > 0) {
                const courseList = document.getElementById('course-list');
                courseList.innerHTML = '';
                state.courses.forEach(course => {
                    addCourse();
                    const lastCourse = courseList.querySelector('.course-item:last-child');
                    if (lastCourse) {
                        lastCourse.querySelector('.course-name').value = course.name;
                        lastCourse.querySelector('.course-price').value = course.price;
                        lastCourse.querySelector('.course-sales').value = course.sales;
                    }
                });
            }

            // Restore projects
            if (state.projects && state.projects.length > 0) {
                const projectList = document.getElementById('labs-project-list');
                projectList.innerHTML = '';
                state.projects.forEach(project => {
                    addProject();
                    const lastProject = projectList.querySelector('.course-item:last-child');
                    if (lastProject) {
                        lastProject.querySelector('.project-name').value = project.name;
                        lastProject.querySelector('.project-value').value = project.value;
                        if (lastProject.querySelector('.project-type')) {
                            lastProject.querySelector('.project-type').value = project.type || 'monthly';
                        }
                    }
                });
            }

            // Restore grants
            if (state.grants && state.grants.length > 0) {
                const grantList = document.getElementById('labs-grant-list');
                grantList.innerHTML = '';
                state.grants.forEach(grant => {
                    addGrant();
                    const lastGrant = grantList.querySelector('.course-item:last-child');
                    if (lastGrant) {
                        lastGrant.querySelector('.grant-name').value = grant.name;
                        lastGrant.querySelector('.grant-value').value = grant.value;
                    }
                });
            }

            // Restore events
            if (state.events && state.events.length > 0) {
                const eventList = document.getElementById('society-events-list');
                eventList.innerHTML = '';
                state.events.forEach(event => {
                    addEvent();
                    const lastEvent = eventList.querySelector('.event-item:last-child');
                    if (lastEvent) {
                        lastEvent.querySelector('.event-name').value = event.name;
                        lastEvent.querySelector('.event-estimated').value = event.estimated;
                        lastEvent.querySelector('.event-actual').value = event.actual;
                    }
                });
            }

            // Recalculate everything
            console.log('🔄 Recalculating all values...');
            handleRevenueInput();
            updateCapitalCalcs();
            updateSafeEquityCalcs();
            updateOperationsCalcs();
            updateRevenueProjectionTotals();

            loadDropdown.style.display = 'none';
            console.log('✅ State loaded and calculations complete!');
            alert('State loaded successfully!');
        }

        function deleteTimestampedState(timestamp, event) {
            event.stopPropagation();

            if (!confirm('Are you sure you want to delete this saved state?')) {
                return;
            }

            const savedStates = JSON.parse(localStorage.getItem('cyberdelicCFOSavedStates') || '[]');
            const filteredStates = savedStates.filter(s => s.timestamp !== timestamp);
            localStorage.setItem('cyberdelicCFOSavedStates', JSON.stringify(filteredStates));
            refreshSavedStatesList();
        }

        function formatTimestamp(isoString) {
            const date = new Date(isoString);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            let timeAgo;
            if (diffMins < 1) {
                timeAgo = 'Just now';
            } else if (diffMins < 60) {
                timeAgo = `${diffMins}m ago`;
            } else if (diffHours < 24) {
                timeAgo = `${diffHours}h ago`;
            } else if (diffDays === 1) {
                timeAgo = 'Yesterday';
            } else if (diffDays < 7) {
                timeAgo = `${diffDays}d ago`;
            } else {
                timeAgo = date.toLocaleDateString();
            }

            const timeStr = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            return { timeStr, timeAgo };
        }

        function refreshSavedStatesList() {
            const savedStates = JSON.parse(localStorage.getItem('cyberdelicCFOSavedStates') || '[]');

            if (savedStates.length === 0) {
                savedStatesList.innerHTML = '<div style="padding: 1rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No saved states yet</div>';
                return;
            }

            // Sort by timestamp (newest first)
            savedStates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            savedStatesList.innerHTML = savedStates.map(state => {
                const { timeStr, timeAgo } = formatTimestamp(state.timestamp);
                return `
                    <button class="saved-state-item" onclick="loadTimestampedState('${state.timestamp}')">
                        <div style="flex: 1;">
                            <div style="font-weight: 500; margin-bottom: 0.25rem;">${timeStr}</div>
                            <div class="saved-state-time">${timeAgo}</div>
                        </div>
                        <button class="delete-state-btn" onclick="deleteTimestampedState('${state.timestamp}', event)">Delete</button>
                    </button>
                `;
            }).join('');
        }

        // Make functions global so they can be called from onclick attributes
        window.loadTimestampedState = loadTimestampedState;
        window.deleteTimestampedState = deleteTimestampedState;

        console.log('✅ Save/Load buttons connected');

        // ============================================
        // MOBILE HAMBURGER MENU
        // ============================================

        const hamburgerBtn = document.getElementById('hamburger-btn');
        const hamburgerIcon = document.getElementById('hamburger-icon');
        const navTabs = document.getElementById('nav-tabs');

        console.log('Hamburger elements:', { hamburgerBtn, hamburgerIcon, navTabs });

        if (hamburgerBtn && navTabs) {
            hamburgerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🍔 Hamburger clicked! Current state:', navTabs.classList.contains('mobile-open'));
                navTabs.classList.toggle('mobile-open');
                hamburgerIcon.classList.toggle('active');
                console.log('New state:', navTabs.classList.contains('mobile-open'));
            });

            // Also listen on the icon itself
            if (hamburgerIcon) {
                hamburgerIcon.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🍔 Icon clicked!');
                    navTabs.classList.toggle('mobile-open');
                    hamburgerIcon.classList.toggle('active');
                });
            }

            // Close menu when a tab is clicked
            document.querySelectorAll('.nav-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        navTabs.classList.remove('mobile-open');
                        hamburgerIcon.classList.remove('active');
                    }
                });
            });

            console.log('✅ Mobile hamburger menu connected');
        } else {
            console.error('❌ Hamburger menu elements not found!', { hamburgerBtn, navTabs });
        }

        // ============================================
        // THEME TOGGLE
        // ============================================

        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = document.getElementById('theme-icon');
        const html = document.documentElement;

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        if (savedTheme === 'light') {
            html.setAttribute('data-theme', 'light');
            themeIcon.textContent = '☀️';
        }

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';

                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);

                themeIcon.textContent = newTheme === 'light' ? '☀️' : '🌙';

                console.log('🎨 Theme switched to:', newTheme);
            });
            console.log('✅ Theme toggle connected');
        }

        // ============================================
        // ELEVATOR PITCH LINKS
        // ============================================

        const pitchDeckLinkInput = document.getElementById('pitch-deck-link');
        const meetingLinkInput = document.getElementById('meeting-link');
        const pitchDeckButton = document.getElementById('pitch-deck-button');
        const meetingButton = document.getElementById('meeting-button');

        // Update button hrefs when inputs change
        if (pitchDeckLinkInput && pitchDeckButton) {
            pitchDeckLinkInput.addEventListener('input', () => {
                const url = pitchDeckLinkInput.value;
                pitchDeckButton.href = url || '#';
                if (url) {
                    pitchDeckButton.setAttribute('target', '_blank');
                    pitchDeckButton.setAttribute('rel', 'noopener noreferrer');
                } else {
                    pitchDeckButton.removeAttribute('target');
                    pitchDeckButton.removeAttribute('rel');
                }
            });
        }

        if (meetingLinkInput && meetingButton) {
            meetingLinkInput.addEventListener('input', () => {
                const url = meetingLinkInput.value;
                meetingButton.href = url || '#';
                if (url) {
                    meetingButton.setAttribute('target', '_blank');
                    meetingButton.setAttribute('rel', 'noopener noreferrer');
                } else {
                    meetingButton.removeAttribute('target');
                    meetingButton.removeAttribute('rel');
                }
            });
        }

        // Normalize all revenue cell formatting on load
        function normalizeRevenueCellFormatting() {
            document.querySelectorAll('.editable-revenue').forEach(input => {
                const value = parseCurrencyValue(input.value) || 0;
                input.value = formatCurrencyShort(value);
            });
        }

        // Small delay to ensure DOM is fully ready, then normalize and update
        setTimeout(() => {
            console.log('🚀 Initial page load: normalizing and updating values...');
            // Normalize formatting and update values
            normalizeRevenueCellFormatting();
            updateRevenueProjectionTotals();
            updateAllConnectedValues();

            // Draw revenue chart after values are loaded
            console.log('📊 Initial page load: drawing revenue chart...');
            drawOnePagerRevenueChart();

            // Sync CAC values to One-Pager on initial load
            if (typeof syncCACToOnePager === 'function') {
                console.log('🔄 Initial page load: syncing CAC values...');
                syncCACToOnePager();
            }
        }, 200);

        // ============================================
        // ONE-PAGER ENHANCEMENTS
        // ============================================

        /**
         * Draws a simple bar/trend chart for revenue projections on the One-Pager
         * Uses native Canvas API to avoid external dependencies
         */
        function drawOnePagerRevenueChart() {
            try {
                console.log('📊 Drawing One-Pager revenue chart...');
                const canvas = document.getElementById('onepager-revenue-chart');
                if (!canvas) {
                    console.error('❌ Canvas element "onepager-revenue-chart" not found!');
                    return;
                }

                // Local helper to ensure parsing works
                const parseVal = (text) => {
                    if (!text) return 0;
                    text = text.trim();
                    const multi = text.toUpperCase().includes('M') ? 1000000 : text.toUpperCase().includes('K') ? 1000 : 1;
                    const val = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
                    return val * multi;
                };

                // Local helper for formatting to avoid any dependency issues
                const formatVal = (val) => {
                    if (val >= 1000000) return '$' + (val / 1000000).toFixed(1) + 'M';
                    if (val >= 1000) return '$' + (val / 1000).toFixed(0) + 'K';
                    return '$' + val.toFixed(0);
                };

                // Get Data
                const y1El = document.getElementById('onepager-year1-revenue');
                const y2El = document.getElementById('onepager-year2-revenue');
                const y3El = document.getElementById('onepager-year3-revenue');

                // Fallback values matching request details
                let v1 = 175000, v2 = 600000, v3 = 1500000;

                if (y1El) v1 = parseVal(y1El.textContent) || v1;
                if (y2El) v2 = parseVal(y2El.textContent) || v2;
                if (y3El) v3 = parseVal(y3El.textContent) || v3;

                console.log('Values:', v1, v2, v3);

                // High DPI setup
                const dpr = window.devicePixelRatio || 1;
                let rect = canvas.getBoundingClientRect();

                // Fallback for hidden/zero-size state
                if (rect.width === 0 || rect.height === 0) {
                    const parent = canvas.parentElement;
                    const parentW = parent ? parent.offsetWidth : 600;
                    const w = parentW || 600;
                    const h = 300;
                    rect = { width: w, height: h };
                    // Force style to match logic
                    canvas.style.width = w + 'px';
                    canvas.style.height = h + 'px';
                }

                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;

                const ctx = canvas.getContext('2d');
                ctx.scale(dpr, dpr);

                const width = rect.width;
                const height = rect.height;

                // Safety clear
                ctx.clearRect(0, 0, width, height);
                // Background debug (remove later if unwanted, but good for proving it works)
                // ctx.fillStyle = 'rgba(255,255,255,0.02)';
                // ctx.fillRect(0,0,width,height);

                const values = [v1, v2, v3];
                const maxVal = Math.max(...values) * 1.2; // 20% headroom

                // Layout
                const padding = 30;
                const chartW = width - (padding * 2);
                const chartH = height - (padding * 2);
                const barWidth = chartW / 4;
                const gap = barWidth * 0.5;

                // Draw Bars
                values.forEach((val, i) => {
                    if (maxVal === 0) return;
                    const h = (val / maxVal) * chartH;
                    const x = padding + (i * (barWidth + gap));
                    const y = height - padding - h;

                    // Glow
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = i === 0 ? 'rgba(0, 212, 255, 0.4)' : i === 1 ? 'rgba(168, 85, 247, 0.4)' : 'rgba(236, 72, 153, 0.4)';

                    // Gradient
                    const gr = ctx.createLinearGradient(x, y, x, height - padding);
                    if (i === 0) { // Year 1 - Cyan
                        gr.addColorStop(0, '#00d4ff'); gr.addColorStop(1, 'rgba(0, 212, 255, 0.2)');
                    } else if (i === 1) { // Year 2 - Purple
                        gr.addColorStop(0, '#a855f7'); gr.addColorStop(1, 'rgba(168, 85, 247, 0.2)');
                    } else { // Year 3 - Pink
                        gr.addColorStop(0, '#ec4899'); gr.addColorStop(1, 'rgba(236, 72, 153, 0.2)');
                    }

                    ctx.fillStyle = gr;

                    // Rounded top bars: use roundRect if supported, else rect
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(x, y, barWidth, h, [8, 8, 0, 0]);
                    } else {
                        ctx.rect(x, y, barWidth, h);
                    }
                    ctx.fill();

                    // Reset Shadow for text
                    ctx.shadowBlur = 0;

                    // Label Year
                    ctx.fillStyle = '#a0a0b0';
                    ctx.font = '500 12px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(`Year ${i + 1}`, x + barWidth / 2, height - padding + 16);

                    // Label Value (on top of bar)
                    ctx.fillStyle = '#fff';
                    ctx.font = '700 12px JetBrains Mono, monospace';
                    ctx.fillText(formatVal(val), x + barWidth / 2, y - 8);
                });

                // Trend Line
                ctx.beginPath();
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]); // Dotted

                values.forEach((val, i) => {
                    const h = (val / maxVal) * chartH;
                    const x = padding + (i * (barWidth + gap)) + barWidth / 2;
                    const y = height - padding - h;

                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.shadowBlur = 0;

                // CAGR Calc Update
                if (v1 > 0 && v3 > 0) {
                    const cagr = (Math.pow(v3 / v1, 0.5) - 1) * 100;
                    const cagrEl = document.getElementById('revenue-cagr');
                    if (cagrEl) cagrEl.textContent = cagr.toFixed(0) + '%';
                }

                console.log('✅ Chart drawn successfully!');
            } catch (e) {
                console.error('CRITICAL ERROR drawing chart:', e);
            }
        }

        /**
         * Sync CAC values from Revenue tab inputs to One-Pager Business Model display
         */
        function syncCACToOnePager() {
            console.log('🔄 Syncing CAC values to One-Pager...');

            const branches = ['society', 'labs', 'academy', 'dojos'];

            branches.forEach(branch => {
                const cacInput = document.getElementById(`${branch}-cac`);
                const onepagerCacDisplay = document.getElementById(`onepager-${branch}-cac`);
                const onepagerLtvDisplay = document.getElementById(`onepager-${branch}-ltv`);
                const onepagerRatioDisplay = document.getElementById(`onepager-${branch}-ratio`);

                if (cacInput && onepagerCacDisplay) {
                    const cac = parseFloat(cacInput.value) || 0;
                    onepagerCacDisplay.textContent = cac;
                    console.log(`✅ ${branch} CAC synced: $${cac}`);

                    // Also update ratio if LTV exists
                    if (onepagerLtvDisplay && onepagerRatioDisplay) {
                        const ltv = parseFloat(onepagerLtvDisplay.textContent) || 0;
                        const ratio = cac > 0 ? (ltv / cac).toFixed(1) : 0;
                        onepagerRatioDisplay.textContent = ratio;
                        console.log(`✅ ${branch} Ratio updated: ${ratio}:1`);
                    }
                } else {
                    console.warn(`⚠️ ${branch} CAC elements not found`, {
                        cacInput: !!cacInput,
                        onepagerCacDisplay: !!onepagerCacDisplay
                    });
                }
            });
        }

        /**
         * Copy shareable link to clipboard
         */
        function copyOnePagerLink() {
            const url = window.location.href.split('#')[0] + '#onepager';

            navigator.clipboard.writeText(url).then(() => {
                // Show success feedback
                const button = event.target;
                const originalText = button.innerHTML;
                button.innerHTML = '✓ Copied!';
                button.style.background = 'var(--accent-green)';

                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.style.background = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy link. Please copy manually: ' + url);
            });
        }

        /**
         * Helper function to parse currency values
         */
        function parseCurrencyValue(text) {
            if (!text) return 0;
            // Remove currency symbols and letters, keep numbers and decimals
            const cleaned = text.replace(/[^0-9.]/g, '');
            const value = parseFloat(cleaned);

            // Handle K and M suffixes
            if (text.includes('K') || text.includes('k')) {
                return value * 1000;
            }
            if (text.includes('M') || text.includes('m')) {
                return value * 1000000;
            }

            return value || 0;
        }

        /**
         * Helper function to format currency with K/M suffix
         */
        function formatCurrencyShort(value) {
            if (value >= 1000000) {
                return '$' + (value / 1000000).toFixed(1) + 'M';
            }
            if (value >= 1000) {
                return '$' + (value / 1000).toFixed(0) + 'K';
            }
            return '$' + value.toFixed(0);
        }

        // BUG 5 FIX: Enhanced tooltip functionality for help icons
        // NOTE: Tooltip initialization has been moved to the consolidated DOMContentLoaded handler above

        // Update revenue chart when revenue projection values change
        // NOTE: MutationObserver setup has been moved to the consolidated DOMContentLoaded handler above

        // ============================================
        // EMERGENCY CHART FALLBACK
        // ============================================

        /**
         * Emergency fallback to ensure chart renders even if other triggers fail
         * Checks every 2 seconds if One-Pager is visible and chart canvas is blank
         */
        let chartCheckInterval = setInterval(function () {
            const onepagerSection = document.getElementById('onepager');
            if (!onepagerSection) {
                console.log('⏳ Emergency fallback: One-Pager section not found yet');
                return;
            }

            // Check if One-Pager tab is currently visible
            const isVisible = onepagerSection.style.display !== 'none';
            if (!isVisible) return;

            const canvas = document.getElementById('onepager-revenue-chart');
            if (!canvas) {
                console.warn('⚠️ Emergency fallback: Canvas element not found');
                return;
            }

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Check if canvas is blank by sampling a pixel
            try {
                const imageData = ctx.getImageData(0, 0, 1, 1);
                const isBlank = imageData.data[3] === 0; // Alpha channel = 0 means transparent/blank

                if (isBlank) {
                    console.log('⚡ Emergency chart redraw triggered - canvas was blank');
                    drawOnePagerRevenueChart();
                }
            } catch (e) {
                // Canvas might not be ready yet, ignore
            }
        }, 2000);

        // ============================================
        // NEW FEATURES - INLINE EDITING SYSTEM
        // ============================================

        /**
         * Makes specified elements editable inline with click-to-edit functionality
         * WHY: Allows founders to customize text without needing to find separate input fields
         * Improves UX by making content feel more direct and editable
         */
        function makeInlineEditable(selector) {
            document.querySelectorAll(selector).forEach(element => {
                // Skip if already editable via contenteditable attribute
                if (element.hasAttribute('contenteditable')) return;

                element.classList.add('editable-inline');
                element.addEventListener('click', function (e) {
                    if (this.classList.contains('editing')) return;

                    const original = this.textContent;
                    const isMultiline = this.offsetHeight > 60 || original.length > 100;

                    const input = document.createElement(isMultiline ? 'textarea' : 'input');
                    input.value = original;
                    input.className = 'inline-edit-input';

                    this.textContent = '';
                    this.appendChild(input);
                    this.classList.add('editing');
                    input.focus();
                    input.select();

                    const save = () => {
                        const newValue = input.value || original;
                        this.textContent = newValue;
                        this.classList.remove('editing');
                        saveAllData(); // Persist changes
                    };

                    input.addEventListener('blur', save);
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && (!isMultiline || e.ctrlKey)) {
                            e.preventDefault();
                            save();
                        }
                        if (e.key === 'Escape') {
                            this.textContent = original;
                            this.classList.remove('editing');
                        }
                    });
                });
            });
        }

        // Apply inline editing to appropriate elements on load
        // WHY: These are descriptive text fields that benefit from inline editing
        // We avoid applying to numerical inputs or calculated fields
        // NOTE: Inline editing initialization has been moved to the consolidated DOMContentLoaded handler above

        // ============================================
        // DASHBOARD DECISION STATUS UPDATES
        // ============================================

        /**
         * Updates the decision status strip and next action hints
         * WHY: Provides founders with actionable guidance based on their current state
         * Prevents analysis paralysis by suggesting the next concrete step
         */
        function updateDashboardStatus() {
            // Get current runway
            const runwayMonths = parseFloat(document.getElementById('runway-months')?.textContent || '0');
            const runwayStatus = document.getElementById('runway-health-status');

            // Update runway health status
            if (runwayMonths < 3) {
                runwayStatus.textContent = `Critical (${runwayMonths} mo)`;
                runwayStatus.className = 'status-value critical';
            } else if (runwayMonths < 6) {
                runwayStatus.textContent = `Urgent (${runwayMonths} mo)`;
                runwayStatus.className = 'status-value warning';
            } else if (runwayMonths < 12) {
                runwayStatus.textContent = `Adequate (${runwayMonths} mo)`;
                runwayStatus.className = 'status-value';
            } else {
                runwayStatus.textContent = `Healthy (${runwayMonths} mo)`;
                runwayStatus.className = 'status-value success';
            }

            // Check LTV:CAC ratio
            const ltvCacText = document.getElementById('ltv-cac-ratio')?.textContent || '0:1';
            const revenueStatus = document.getElementById('revenue-model-status');

            if (ltvCacText === '0:1' || ltvCacText === 'N/A') {
                revenueStatus.textContent = 'Needs validation';
                revenueStatus.className = 'status-value warning';
            } else {
                const ratio = parseFloat(ltvCacText.split(':')[0]);
                if (ratio >= 3) {
                    revenueStatus.textContent = `Strong (${ltvCacText})`;
                    revenueStatus.className = 'status-value success';
                } else if (ratio >= 2) {
                    revenueStatus.textContent = `Moderate (${ltvCacText})`;
                    revenueStatus.className = 'status-value';
                } else {
                    revenueStatus.textContent = `Weak (${ltvCacText})`;
                    revenueStatus.className = 'status-value warning';
                }
            }

            // Determine raise readiness
            const raiseStatus = document.getElementById('raise-readiness-status');
            const hasRevenue = ltvCacText !== '0:1' && ltvCacText !== 'N/A';
            const hasRunway = runwayMonths > 3;

            if (hasRevenue && hasRunway && runwayMonths >= 12) {
                raiseStatus.textContent = 'Ready to raise';
                raiseStatus.className = 'status-value success';
            } else if (hasRevenue && hasRunway) {
                raiseStatus.textContent = 'Nearly ready';
                raiseStatus.className = 'status-value';
            } else {
                raiseStatus.textContent = 'Not ready';
                raiseStatus.className = 'status-value warning';
            }

            // Update next action hint
            const nextActionEl = document.getElementById('next-action-text');
            if (runwayMonths < 3) {
                nextActionEl.textContent = 'URGENT: Your runway is critical. Review Operations tab and consider immediate fundraising.';
            } else if (ltvCacText === '0:1' || ltvCacText === 'N/A') {
                nextActionEl.textContent = 'Calculate your customer economics in the Revenue tab to validate your business model.';
            } else if (runwayMonths < 6) {
                nextActionEl.textContent = 'Review Capital Raise tab to model funding scenarios and extend your runway.';
            } else if (!hasRevenue) {
                nextActionEl.textContent = 'Document your assumptions in the Business Plan tab to identify validation needs.';
            } else {
                nextActionEl.textContent = 'Your fundamentals look solid. Focus on execution and tracking actual vs. projected metrics.';
            }
        }

        // Update dashboard status whenever relevant values change
        // WHY: Keep guidance current as founder updates their numbers
        const dashboardUpdateInterval = setInterval(updateDashboardStatus, 2000);
        updateDashboardStatus(); // Initial update

        // ============================================
        // BUSINESS PLAN COHERENCE CHECKING
        // ============================================

        /**
         * Checks for potential inconsistencies in business plan
         * WHY: Helps founders spot red flags that investors will notice
         * Soft warnings, not blocking - encourages reflection without being prescriptive
         */
        function checkBusinessPlanCoherence() {
            const warnings = [];
            const warningsEl = document.getElementById('business-plan-warnings');
            if (!warningsEl) return;

            // Check: High revenue growth without explaining team scaling
            const year1Rev = parseCurrencyValue(document.getElementById('revenue-year1-total')?.textContent || '$0');
            const year3Rev = parseCurrencyValue(document.getElementById('revenue-year3-total')?.textContent || '$0');

            if (year1Rev > 0 && year3Rev / year1Rev > 8) {
                warnings.push('⚠️ You\'re projecting >8x revenue growth over 3 years. Consider documenting how you\'ll scale operations in your assumptions.');
            }

            // Check: Very high burn rate relative to year 1 revenue
            const burnRate = parseFloat(document.getElementById('monthly-burn')?.value || '0');
            const monthlyBurnVsRevenue = (burnRate * 12) / year1Rev;

            if (year1Rev > 0 && monthlyBurnVsRevenue > 5) {
                warnings.push('⚠️ Your annual burn rate is >5x your Year 1 revenue. This may raise questions about path to profitability.');
            }

            // Display warnings
            warningsEl.innerHTML = warnings.map(w =>
                `<div class="coherence-warning">${w}</div>`
            ).join('');
        }

        // Run coherence check when user switches to Business Plan tab
        // WHY: Only check when relevant, avoid constant interruptions
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.dataset.section === 'business-plan') {
                    setTimeout(checkBusinessPlanCoherence, 500);
                }
            });
        });

        // ============================================
        // CAPITAL RAISE INTENT GUIDANCE
        // ============================================

        /**
         * Updates fundraising guidance based on selected intent
         * WHY: Different fundraising goals require different amounts and strategies
         * Helps founders think about milestones, not just minimizing dilution
         */
        const raiseIntentSelect = document.getElementById('raise-intent');
        if (raiseIntentSelect) {
            raiseIntentSelect.addEventListener('change', (e) => {
                const intent = e.target.value;
                const runwayTarget = document.getElementById('runway-target');
                const capitalWarnings = document.getElementById('capital-warnings');

                if (!runwayTarget || !capitalWarnings) return;

                let suggestion = '';
                let targetMonths = 18;

                switch (intent) {
                    case 'survival':
                        targetMonths = 12;
                        suggestion = '<div class="alert-info"><strong>Survival Mode:</strong> You\'re raising enough to prove your core hypothesis or reach break-even. Keep burn low and focus on one key metric. Typical range: 12-15 months runway.</div>';
                        break;
                    case 'momentum':
                        targetMonths = 18;
                        suggestion = '<div class="alert-info"><strong>Momentum Building:</strong> You need time to validate product-market fit and show repeatable customer acquisition. Typical range: 18-24 months runway to hit Series A milestones.</div>';
                        break;
                    case 'acceleration':
                        targetMonths = 24;
                        suggestion = '<div class="alert-info"><strong>Scaling Mode:</strong> You have proven unit economics and need capital to scale GTM. Focus on maintaining healthy CAC payback while growing. Typical range: 24-36 months runway.</div>';
                        break;
                }

                if (suggestion) {
                    runwayTarget.value = targetMonths;
                    runwayTarget.dispatchEvent(new Event('input'));
                    capitalWarnings.innerHTML = suggestion;
                }
            });
        }

        // ============================================
        // SAVE/LOAD WITH NAMING SYSTEM
        // ============================================

        /**
         * Enhanced save system with multiple named saves
         * WHY: Founders need to model different scenarios (conservative, aggressive, etc.)
         * without losing their work. Named saves prevent accidental overwrites.
         */

        // Get or initialize saves object from localStorage
        function getAllSaves() {
            const savesJson = localStorage.getItem('cfo-saves');
            return savesJson ? JSON.parse(savesJson) : {};
        }

        /**
         * CRITICAL FIX: Collect all data from the form
         * This function was missing and causing saveWithName() to fail
         */
        function collectAllData() {
            console.log('📦 Collecting all data...');
            const data = {
                revenueInputs: {},
                capitalInputs: {},
                operationsInputs: {},
                revenueProjections: {},
                editableText: {},
                courses: [],
                projects: [],
                grants: [],
                events: [],
                fixedCosts: [],
                variableCosts: [],
                timestamp: new Date().toISOString()
            };

            // Save all input fields by ID
            document.querySelectorAll('input[type="number"], input[type="text"], input[type="range"]').forEach(input => {
                if (input.id) {
                    data.revenueInputs[input.id] = input.value;
                }
            });

            // Save editable revenue input fields
            document.querySelectorAll('.editable-revenue').forEach(input => {
                const year = input.dataset.year;
                const stream = input.dataset.stream;
                if (year && stream) {
                    data.revenueProjections[`${stream}-year${year}`] = input.value;
                }
            });

            // Save all contenteditable text fields
            document.querySelectorAll('[contenteditable="true"]').forEach(element => {
                if (element.id) {
                    data.editableText[element.id] = element.textContent || element.innerHTML;
                }
            });

            // Save courses
            document.querySelectorAll('#course-list .course-item').forEach(item => {
                data.courses.push({
                    name: item.querySelector('.course-name').value,
                    price: item.querySelector('.course-price').value,
                    sales: item.querySelector('.course-sales').value
                });
            });

            // Save labs projects
            document.querySelectorAll('#labs-project-list .course-item').forEach(item => {
                const typeSelect = item.querySelector('.project-type');
                data.projects.push({
                    name: item.querySelector('.project-name').value,
                    value: item.querySelector('.project-value').value,
                    type: typeSelect ? typeSelect.value : 'monthly'
                });
            });

            // Save labs grants/partnerships
            document.querySelectorAll('#labs-grant-list .course-item').forEach(item => {
                data.grants.push({
                    name: item.querySelector('.grant-name').value,
                    value: item.querySelector('.grant-value').value
                });
            });

            // Save society events
            document.querySelectorAll('#society-events-list .event-item').forEach(item => {
                data.events.push({
                    name: item.querySelector('.event-name').value,
                    estimated: item.querySelector('.event-estimated').value,
                    actual: item.querySelector('.event-actual').value
                });
            });

            // Save fixed costs
            const fixedCosts = [];
            document.querySelectorAll('#fixed-costs-list .fixed-cost-item').forEach(costItem => {
                fixedCosts.push({
                    name: costItem.querySelector('.fixed-cost-name').value,
                    value: costItem.querySelector('.fixed-cost-value').value
                });
            });
            data.fixedCosts = fixedCosts;

            // Save variable costs
            const variableCosts = [];
            document.querySelectorAll('#variable-costs-list .variable-cost-item').forEach(costItem => {
                variableCosts.push({
                    name: costItem.querySelector('.variable-cost-name').value,
                    value: costItem.querySelector('.variable-cost-value').value
                });
            });
            data.variableCosts = variableCosts;

            console.log('✅ Data collection complete:', {
                inputsCount: Object.keys(data.revenueInputs).length,
                coursesCount: data.courses.length,
                projectsCount: data.projects.length,
                grantsCount: data.grants.length,
                eventsCount: data.events.length,
                fixedCostsCount: data.fixedCosts.length,
                variableCostsCount: data.variableCosts.length
            });

            return data;
        }

        /**
         * CRITICAL FIX: Restore all data to the form
         * This function was missing and causing loadSave() to fail
         */
        function restoreAllData(data) {
            if (!data) {
                console.error('❌ No data to restore');
                return false;
            }

            console.log('📂 Restoring all data...');

            try {
                // Restore all input fields
                Object.keys(data.revenueInputs || {}).forEach(id => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.value = data.revenueInputs[id];
                    }
                });

                // Restore editable revenue input fields
                Object.keys(data.revenueProjections || {}).forEach(key => {
                    const [stream, yearPart] = key.split('-year');
                    const input = document.querySelector(`.editable-revenue[data-year="${yearPart}"][data-stream="${stream}"]`);
                    if (input) {
                        input.value = data.revenueProjections[key];
                    }
                });

                // Restore contenteditable text fields
                Object.keys(data.editableText || {}).forEach(identifier => {
                    const element = document.getElementById(identifier);
                    if (element) {
                        element.textContent = data.editableText[identifier];
                    }
                });

                // Restore courses - clear existing and add saved
                const courseList = document.getElementById('course-list');
                if (courseList && data.courses) {
                    courseList.innerHTML = '';
                    data.courses.forEach(course => {
                        addCourse(course.name, course.price, course.sales);
                    });
                }

                // Restore labs projects
                const projectList = document.getElementById('labs-project-list');
                if (projectList && data.projects) {
                    projectList.innerHTML = '';
                    data.projects.forEach(project => {
                        addLabsProject(project.name, project.value, project.type);
                    });
                }

                // Restore labs grants
                const grantList = document.getElementById('labs-grant-list');
                if (grantList && data.grants) {
                    grantList.innerHTML = '';
                    data.grants.forEach(grant => {
                        addLabsGrant(grant.name, grant.value);
                    });
                }

                // Restore society events
                const eventsList = document.getElementById('society-events-list');
                if (eventsList && data.events) {
                    eventsList.innerHTML = '';
                    data.events.forEach(event => {
                        addSocietyEvent(event.name, event.estimated, event.actual);
                    });
                }

                // Restore fixed costs
                const fixedCostsList = document.getElementById('fixed-costs-list');
                if (fixedCostsList && data.fixedCosts) {
                    fixedCostsList.innerHTML = '';
                    data.fixedCosts.forEach(cost => {
                        addFixedCost(cost.name, cost.value);
                    });
                }

                // Restore variable costs
                const variableCostsList = document.getElementById('variable-costs-list');
                if (variableCostsList && data.variableCosts) {
                    variableCostsList.innerHTML = '';
                    data.variableCosts.forEach(cost => {
                        addVariableCost(cost.name, cost.value);
                    });
                }

                // Recalculate all values after loading
                if (typeof updateRevenueCalcs === 'function') updateRevenueCalcs();
                if (typeof updateOperationsCalcs === 'function') updateOperationsCalcs();
                if (typeof updateCapitalCalcs === 'function') updateCapitalCalcs();
                if (typeof updateRevenueProjectionTotals === 'function') updateRevenueProjectionTotals();
                if (typeof updateAllConnectedValues === 'function') updateAllConnectedValues();
                if (typeof drawOnePagerRevenueChart === 'function') drawOnePagerRevenueChart();

                console.log('✅ Data restored successfully');
                return true;

            } catch (error) {
                console.error('❌ Error restoring data:', error);
                return false;
            }
        }

        function saveWithName(name) {
            if (!name || name.trim().length === 0) {
                alert('Please enter a name for this save');
                return;
            }

            // Validate name
            const cleanName = name.trim().substring(0, 50);
            if (!/^[a-zA-Z0-9\s\-_]+$/.test(cleanName)) {
                alert('Save name can only contain letters, numbers, spaces, hyphens, and underscores');
                return;
            }

            console.log('💾 Saving with name:', cleanName);
            const allSaves = getAllSaves();
            const data = collectAllData(); // Use existing data collection function

            allSaves[cleanName] = {
                data: data,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };

            localStorage.setItem('cfo-saves', JSON.stringify(allSaves));
            console.log('✅ Saved to localStorage with name:', cleanName);

            // Also update default save for backwards compatibility
            localStorage.setItem('cyberdelicCFOData', JSON.stringify(data));
            console.log('✅ Also saved to default storage for backwards compatibility');

            updateSavedStatesList();
            console.log('✅ Save complete! Total saves:', Object.keys(allSaves).length);
            return cleanName;
        }

        function loadSave(name) {
            console.log('📂 Loading save:', name);
            const allSaves = getAllSaves();
            const saveData = allSaves[name];

            if (!saveData) {
                console.error('❌ Save not found:', name);
                alert(`Save "${name}" not found`);
                return;
            }

            console.log('✅ Save data found, restoring...');
            // Use existing load functionality
            const success = restoreAllData(saveData.data);

            if (success) {
                console.log('✅ Save loaded successfully!');
                alert(`Loaded "${name}" successfully!`);
            } else {
                console.error('❌ Failed to restore data');
                alert('Failed to load save data. Check console for details.');
            }
        }

        function deleteSave(name) {
            if (!confirm(`Delete save "${name}"? This cannot be undone.`)) {
                return;
            }

            const allSaves = getAllSaves();
            delete allSaves[name];
            localStorage.setItem('cfo-saves', JSON.stringify(allSaves));
            updateSavedStatesList();
        }

        function renameSave(oldName) {
            const newName = prompt(`Rename "${oldName}" to:`, oldName);
            if (!newName || newName === oldName) return;

            const cleanName = newName.trim().substring(0, 50);
            if (!/^[a-zA-Z0-9\s\-_]+$/.test(cleanName)) {
                alert('Save name can only contain letters, numbers, spaces, hyphens, and underscores');
                return;
            }

            const allSaves = getAllSaves();
            if (allSaves[cleanName]) {
                alert('A save with that name already exists');
                return;
            }

            allSaves[cleanName] = allSaves[oldName];
            delete allSaves[oldName];
            localStorage.setItem('cfo-saves', JSON.stringify(allSaves));
            updateSavedStatesList();
        }

        function updateSavedStatesList() {
            const listEl = document.getElementById('saved-states-list');
            if (!listEl) return;

            const allSaves = getAllSaves();
            const saveNames = Object.keys(allSaves).sort();

            if (saveNames.length === 0) {
                listEl.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">No saved states yet</div>';
                return;
            }

            listEl.innerHTML = saveNames.map(name => {
                const save = allSaves[name];
                const date = new Date(save.timestamp).toLocaleDateString();

                return `
                    <div class="saved-item">
                        <div>
                            <div class="saved-item-name">${name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${date}</div>
                        </div>
                        <div class="saved-item-actions">
                            <button class="btn-rename" onclick="renameSave('${name}')">Rename</button>
                            <button class="btn-load-item" onclick="loadSave('${name}'); document.getElementById('load-dropdown').style.display='none';">Load</button>
                            <button class="btn-delete-item" onclick="deleteSave('${name}')">Delete</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Override existing save button to prompt for name
        const saveBtn = document.getElementById('header-save-btn');
        if (saveBtn) {
            // Remove existing click listeners by cloning
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

            newSaveBtn.addEventListener('click', () => {
                const name = prompt('Name this save:', 'Financial Model ' + new Date().toLocaleDateString());
                if (name) {
                    saveWithName(name);
                    alert(`Saved as "${name}"`);
                }
            });
        }

        // Update saved states list when load dropdown opens
        const loadBtn = document.getElementById('header-load-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', updateSavedStatesList);
        }

        // Initial population
        updateSavedStatesList();

        // Make functions globally available
        window.renameSave = renameSave;
        window.loadSave = loadSave;
        window.deleteSave = deleteSave;

        // ============================================
        // PERSIST BOTTLENECK ANALYSIS
        // ============================================

        /**
         * Save and restore bottleneck analysis text
         * WHY: These reflections are valuable for pitch prep and shouldn't be lost
         */
        const bottleneckInputs = ['bottleneck-demand', 'bottleneck-risk', 'bottleneck-people'];

        bottleneckInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Load saved value
                const saved = localStorage.getItem(id);
                if (saved) el.value = saved;

                // Save on change
                el.addEventListener('input', () => {
                    localStorage.setItem(id, el.value);
                });
            }
        });

        // ============================================
        // PERSIST BUSINESS PLAN STRUCTURED SECTIONS
        // ============================================

        /**
         * Save and restore assumptions, risks, and questions
         * WHY: Critical for tracking what founders know vs. what they need to validate
         */
        const structuredInputs = ['business-assumptions', 'business-risks', 'business-questions'];

        structuredInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                // Load saved value
                const saved = localStorage.getItem(id);
                if (saved) el.textContent = saved;

                // Save on change (contenteditable uses textContent)
                el.addEventListener('input', () => {
                    localStorage.setItem(id, el.textContent);
                });
            }
        });

        // ============================================
        // BUG 3 FIX: Update bottom button links dynamically
        // ============================================
        const pitchDeckLinkBottom = document.getElementById('pitch-deck-link-bottom');
        const pitchDeckButtonBottom = document.getElementById('pitch-deck-button-bottom');
        const meetingLinkBottom = document.getElementById('meeting-link-bottom');
        const meetingButtonBottom = document.getElementById('meeting-button-bottom');

        if (pitchDeckLinkBottom && pitchDeckButtonBottom) {
            pitchDeckLinkBottom.addEventListener('input', () => {
                const url = pitchDeckLinkBottom.value;
                pitchDeckButtonBottom.href = url || '#';
                if (url) {
                    pitchDeckButtonBottom.setAttribute('target', '_blank');
                    pitchDeckButtonBottom.setAttribute('rel', 'noopener noreferrer');
                }
            });
        }

        if (meetingLinkBottom && meetingButtonBottom) {
            meetingLinkBottom.addEventListener('input', () => {
                const url = meetingLinkBottom.value;
                meetingButtonBottom.href = url || '#';
                if (url) {
                    meetingButtonBottom.setAttribute('target', '_blank');
                    meetingButtonBottom.setAttribute('rel', 'noopener noreferrer');
                }
            });
        }

        // ============================================
        // BUG 4 FIX: Editable Roadmap Milestones
        // ============================================
        let roadmapMilestones = [
            { month: 0, title: 'Foundation', description: 'XD Canvas framework published, 500+ newsletter subscribers', status: 'achieved', icon: '✓' },
            { month: 3, title: 'Society Launch', description: '500 members, $30K MRR, first Dojo pop-up', status: 'current', icon: '→' },
            { month: 6, title: 'Academy Goes Live', description: '5 courses launched, 200 enrolled students, 2 certifications', status: 'future', icon: '' },
            { month: 12, title: 'Labs Scaling', description: '5 consulting clients, 2 R&D grants, $75K MRR', status: 'future', icon: '' },
            { month: 18, title: 'Break-Even', description: '$100K MRR, 2,000+ members, Series A readiness', status: 'milestone', icon: '🎉' }
        ];

        function saveRoadmapMilestones() {
            localStorage.setItem('roadmapMilestones', JSON.stringify(roadmapMilestones));
            console.log('Roadmap milestones saved');
        }

        function loadRoadmapMilestones() {
            const saved = localStorage.getItem('roadmapMilestones');
            if (saved) {
                try {
                    roadmapMilestones = JSON.parse(saved);
                    console.log('Roadmap milestones loaded');
                } catch (e) {
                    console.error('Error loading roadmap milestones:', e);
                }
            }
        }

        function renderRoadmapMilestones() {
            const container = document.getElementById('roadmap-milestones-container');
            if (!container) return;

            container.innerHTML = '';
            container.className = 'roadmap-container'; // FIX 4: Use grid layout

            roadmapMilestones.forEach((milestone, index) => {
                // Create milestone card
                const card = document.createElement('div');
                card.className = 'milestone-card';

                // Remove button
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-milestone';
                removeBtn.innerHTML = '×';
                removeBtn.onclick = () => removeMilestone(index);
                card.appendChild(removeBtn);

                // Month header
                const header = document.createElement('div');
                header.className = 'milestone-header';
                header.innerHTML = `
                    <span class="milestone-month-label">Month</span>
                    <input type="number" class="milestone-month-input" value="${milestone.month}" min="0" max="36" data-index="${index}">
                `;
                card.appendChild(header);

                // Title input
                const titleInput = document.createElement('input');
                titleInput.type = 'text';
                titleInput.className = 'milestone-title-input';
                titleInput.value = milestone.title;
                titleInput.placeholder = 'Milestone title';
                titleInput.dataset.index = index;
                card.appendChild(titleInput);

                // Description textarea
                const descTextarea = document.createElement('textarea');
                descTextarea.className = 'milestone-desc-input';
                descTextarea.value = milestone.description;
                descTextarea.placeholder = 'Description...';
                descTextarea.dataset.index = index;
                card.appendChild(descTextarea);

                // Status select
                const statusSelect = document.createElement('select');
                statusSelect.className = 'milestone-status-select';
                statusSelect.innerHTML = `
                    <option value="achieved" ${milestone.status === 'achieved' ? 'selected' : ''}>✓ Achieved</option>
                    <option value="current" ${milestone.status === 'current' ? 'selected' : ''}>→ Current</option>
                    <option value="future" ${milestone.status === 'future' ? 'selected' : ''}>○ Future</option>
                    <option value="milestone" ${milestone.status === 'milestone' ? 'selected' : ''}>🎉 Milestone</option>
                `;
                statusSelect.dataset.index = index;
                card.appendChild(statusSelect);

                container.appendChild(card);
            });

            // Attach event listeners
            container.querySelectorAll('.milestone-month-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    roadmapMilestones[index].month = parseInt(e.target.value);
                    saveRoadmapMilestones();
                });
            });

            container.querySelectorAll('.milestone-status-select').forEach(select => {
                select.addEventListener('change', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    const status = e.target.value;
                    roadmapMilestones[index].status = status;

                    // Update icon based on status
                    if (status === 'achieved') roadmapMilestones[index].icon = '✓';
                    else if (status === 'current') roadmapMilestones[index].icon = '→';
                    else if (status === 'milestone') roadmapMilestones[index].icon = '🎉';
                    else roadmapMilestones[index].icon = '';

                    saveRoadmapMilestones();
                });
            });

            container.querySelectorAll('.milestone-title-input').forEach(input => {
                input.addEventListener('blur', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    roadmapMilestones[index].title = e.target.value;
                    saveRoadmapMilestones();
                });
            });

            container.querySelectorAll('.milestone-desc-input').forEach(textarea => {
                textarea.addEventListener('blur', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    roadmapMilestones[index].description = e.target.value;
                    saveRoadmapMilestones();
                });
            });
        }

        function addRoadmapMilestone() {
            roadmapMilestones.push({
                month: Math.max(...roadmapMilestones.map(m => m.month)) + 3,
                title: 'New Milestone',
                description: 'Describe the milestone achievements here',
                status: 'future',
                icon: ''
            });
            saveRoadmapMilestones();
            renderRoadmapMilestones();
        }

        function removeMilestone(index) {
            if (roadmapMilestones.length <= 1) {
                alert('You must have at least one milestone');
                return;
            }
            if (confirm('Remove this milestone?')) {
                roadmapMilestones.splice(index, 1);
                saveRoadmapMilestones();
                renderRoadmapMilestones();
            }
        }

        // Initialize roadmap
        loadRoadmapMilestones();
        renderRoadmapMilestones();

        // ============================================
        // BUG 1 FIX: Enhanced Save/Load with Debug Logs
        // ============================================
        console.log('Financial Matrix initialized');
        console.log('LocalStorage available:', typeof (Storage) !== "undefined");
        console.log('Saved data exists:', localStorage.getItem('cyberdelicCFOData') !== null);

        // ============================================
        // CHART EMERGENCY FIX: Simple Backup Chart Function
        // ============================================
        function drawOnePagerRevenueChartSimple() {
            console.log('📊 SIMPLE chart draw started');
            const canvas = document.getElementById('onepager-revenue-chart');
            if (!canvas) {
                console.error('❌ NO CANVAS FOUND');
                return;
            }

            const ctx = canvas.getContext('2d');
            canvas.width = 800;
            canvas.height = 300;

            // Clear canvas
            ctx.clearRect(0, 0, 800, 300);

            // Draw simple test pattern
            ctx.fillStyle = '#00d4ff';
            ctx.fillRect(50, 50, 100, 200);
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(200, 100, 100, 150);
            ctx.fillStyle = '#ec4899';
            ctx.fillRect(350, 25, 100, 225);

            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.fillText('Year 1', 75, 270);
            ctx.fillText('Year 2', 225, 270);
            ctx.fillText('Year 3', 375, 270);

            ctx.fillText('$175K', 75, 40);
            ctx.fillText('$600K', 225, 90);
            ctx.fillText('$1.5M', 375, 15);

            console.log('✅ SIMPLE chart drawn');
        }

        // ============================================
        // CHART EMERGENCY FIX: Window Load Initialization
        // ============================================
        window.addEventListener('load', function() {
            console.log('🚀 Window loaded, initializing chart system...');

            // Wait for everything to be ready
            setTimeout(function() {
                // Check if One-Pager is the active tab
                const onepagerTab = document.querySelector('[data-section="onepager"]');
                const onepagerSection = document.getElementById('onepager');

                if (onepagerTab && onepagerTab.classList.contains('active')) {
                    console.log('📊 One-Pager is active on load, drawing chart...');
                    drawOnePagerRevenueChart();
                }

                // Also try drawing it anyway if the canvas exists
                const canvas = document.getElementById('onepager-revenue-chart');
                if (canvas) {
                    console.log('📊 Force-drawing chart to ensure it appears...');
                    drawOnePagerRevenueChart();
                }
            }, 1000);
        });

        // ============================================
        // CHART EMERGENCY FIX: Emergency Fallback Interval
        // ============================================
        // Force chart to draw every 3 seconds if One-Pager is visible and canvas is blank
        setInterval(function() {
            const section = document.getElementById('onepager');
            if (section && section.classList.contains('active')) {
                const canvas = document.getElementById('onepager-revenue-chart');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    // Check if canvas is blank
                    try {
                        const imageData = ctx.getImageData(0, 0, 1, 1);
                        if (imageData.data[3] === 0) {
                            console.log('⚡ EMERGENCY: Redrawing blank chart...');
                            drawOnePagerRevenueChart();
                        }
                    } catch (e) {
                        // If we can't check, just try drawing
                        console.log('⚡ EMERGENCY: Attempting chart redraw...');
                        drawOnePagerRevenueChart();
                    }
                }
            }
        }, 3000);

        // ============================================
        // INITIALIZATION: Run all calculations on page load
        // ============================================
        // NOTE: Initial calculations have been moved to the consolidated DOMContentLoaded handler above

    