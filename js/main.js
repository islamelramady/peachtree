(function () {
  "use strict";

  var lang = "ar";
  try { lang = localStorage.getItem("pt-lang") || "ar"; } catch (e) {}
  var theme = "light";
  try { theme = localStorage.getItem("pt-theme") || "light"; } catch (e) {}

  function t(o) { return lang === "ar" ? o.ar : o.en; }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function num(n) { return n.toLocaleString("en-US"); }
  function CUR() { return lang === "ar" ? "ج.م" : "EGP"; }

  var SALES_STEPS = [
    {
      name: { ar: "أمر المبيعات", en: "Sales Order" },
      path: "Tasks > Quotes/Sales Orders > Sales Orders",
      desc: {
        ar: "بنسجلّل طلب العميل لما يكون فيه فجوة زمنية بين ما يطلب البضاعة وبين ما يستلمها فعلًا.",
        en: "We record the customer's request when there is a time gap between ordering and actual delivery."
      },
      notes: [
        { ar: "بيتستخدم مع العملاء اللي بيطلّعوا كَمِيّات كبيرة أو بيسلّموا بعد فترة.", en: "Used with customers ordering bulk quantities or taking delivery later." }
      ]
    },
    {
      name: { ar: "فاتورة المبيعات", en: "Sales Invoicing" },
      path: "Tasks > Sales/Invoicing",
      desc: {
        ar: "الفاتورة بتتعمل للعميل لما يشتري بالآجل — وفيها الأصناف والكميات والأسعار.",
        en: "The invoice is issued when the customer buys on credit — with items, quantities and prices."
      },
      notes: [
        { ar: "تبويب Apply to Sales Order → لما البيع يكون بناءً على أمر بيع سابق.", en: "Tab <b>Apply to Sales Order</b> → when the sale is based on a prior sales order." },
        { ar: "تبويب Apply to Sales → لما البيع مباشر من غير أمر بيع.", en: "Tab <b>Apply to Sales</b> → when the sale is direct, without a sales order." },
        { ar: "تقدّر تطبع الفاتورة ورقية أو تصدّرها PDF وتبعتها بالإيميل.", en: "Print it, or export a PDF and email it to the customer." }
      ]
    },
    {
      name: { ar: "تحصيل المقبوضات", en: "Receipts" },
      path: "Tasks > Receipts",
      desc: {
        ar: "هنا نسجّل الفلوس اللي داخلة: كاش أو شيكات من العميل.",
        en: "Here we record money coming in: cash or cheques from the customer."
      },
      notes: [
        { ar: "Apply to Invoices → لما العميل يسدّد فواتير متعددة أو جزء من فاتورة.", en: "<b>Apply to Invoices</b> → when the customer settles several invoices or part of one." },
        { ar: "Apply to Revenues → لما يسدّد الفاتورة بالكامل أو تحصّل إيراد مباشر.", en: "<b>Apply to Revenues</b> → when an invoice is settled in full or revenue is collected directly." }
      ]
    },
    {
      name: { ar: "إيداع الأموال", en: "Select for Deposit" },
      path: "Tasks > Select for Deposit",
      desc: {
        ar: "بتجمّع المقبوضات النقدية والشيكات مع بعض وتعدّ قسيمة الإيداع البنكي.",
        en: "You gather the cash receipts and cheques together and prepare the bank deposit slip."
      },
      notes: [
        { ar: "الخطوة الأخيرة في دورة البيع، وبعدها الفلوس تبقى في حساب البنك.", en: "The final step of the sales cycle — after it, the money sits in the bank account." }
      ]
    }
  ];

  var BUY_STEPS = [
    {
      name: { ar: "أمر الشراء", en: "Purchase Order" },
      path: "Tasks > Purchase Orders",
      desc: {
        ar: "طلب البضاعة الموجّه للمورد — إحنا اللي بنطلب منه.",
        en: "The order sent to the vendor — we are the buyer here."
      },
      notes: [{ ar: "بيمشي على المورد قبل ما الشحنة توصل.", en: "Goes to the vendor before the shipment arrives." }]
    },
    {
      name: { ar: "استلام والفاتورة", en: "Purchases / Receive Inventory" },
      path: "Tasks > Purchases/Receive Inventory",
      desc: {
        ar: "بتسجّل الفاتورة الواردة من المورد مع استلام الشحنة والبضاعة.",
        en: "You record the incoming vendor invoice along with receiving the shipment and goods."
      },
      notes: [{ ar: "المخزون يتحدّث تلقائيًا داخل البرنامج.", en: "Inventory levels update automatically inside the program." }]
    },
    {
      name: { ar: "سداد المستحقات", en: "Payments" },
      path: "Tasks > Payments",
      desc: {
        ar: "بتخرج مدفوعات للموردين بشيك أو نقدًا — دي آخر خطوة في دورة الشراء.",
        en: "Payments go out to vendors by cheque or cash — the last step of the purchase cycle."
      },
      notes: [
        { ar: "Apply to Invoices → لدفع فواتير مشتريات سابقة.", en: "<b>Apply to Invoices</b> → to pay previous purchase invoices." },
        { ar: "Apply to Expenses → للمصروفات المباشرة اللي مالهاش علاقة بطلب شراء أو مخزون.", en: "<b>Apply to Expenses</b> → for direct expenses not tied to a purchase order or inventory." }
      ]
    }
  ];

  var EMPLOYEES = [
    { id: "EMP-101", name: { ar: "أحمد السيد", en: "Ahmed Elsayed" }, ava: "👨‍🔧", hours: 46, rate: 35 },
    { id: "EMP-102", name: { ar: "منى صلاح", en: "Mona Salah" }, ava: "👩‍💼", hours: 42, rate: 40 },
    { id: "EMP-103", name: { ar: "كريم عبد الله", en: "Karim Abdallah" }, ava: "👨‍🍳", hours: 50, rate: 25 }
  ];

  var AGED = [
    { label: { ar: "٠ - ٣٠ يوم", en: "0-30 days" }, amount: 45200, cls: "df-good", note: { ar: "لسه في المدة", en: "Not due yet" } },
    { label: { ar: "٣١ - ٦٠ يوم", en: "31-60 days" }, amount: 28500, cls: "df-warn", note: { ar: "بداية تأخير - اتصال وتذكير", en: "Early delay - call & remind" } },
    { label: { ar: "٦١ - ٩٠ يوم", en: "61-90 days" }, amount: 15300, cls: "df-late", note: { ar: "تأخير واضح - راجع الحد الائتماني", en: "Clear delay - review credit limit" } },
    { label: { ar: "٩٠+ يوم", en: "90+ days" }, amount: 9800, cls: "df-bad", note: { ar: "تحصيل فوري أو إيقاف التعامل", en: "Collect now - or stop dealing" } }
  ];

  var CENTERS = [
    { ar: "ملخص النشاط", en: "Business Status", emoji: "📈" },
    { ar: "العملاء والمبيعات", en: "Customers & Sales", emoji: "🛒" },
    { ar: "الموردون والمشتريات", en: "Vendors & Purchases", emoji: "🚚" },
    { ar: "المخزون والخدمات", en: "Inventory & Services", emoji: "📦" },
    { ar: "الموظفون والأجور", en: "Employees & Payroll", emoji: "🧑‍💼" },
    { ar: "البنوك", en: "Banking", emoji: "🏦" },
    { ar: "الأستاذ العام", en: "General Ledger", emoji: "📚" }
  ];

  var MENUS = [
    {
      key: "File", ar: "ملف", en: "File",
      items: [
        { name: { ar: "شركة جديدة", en: "New Company" }, kbd: "Ctrl+N", path: "File > New", desc: { ar: "إنشاء شركة جديدة من الصفر وبدء إعداد بياناتها.", en: "Create a new company from scratch and start setting it up." } },
        { name: { ar: "فتح شركة", en: "Open Company" }, kbd: "Ctrl+O", path: "File > Open", desc: { ar: "فتح ملف شركة موجود بالفعل على الجهاز.", en: "Open an existing company file from the computer." } }
      ]
    },
    {
      key: "Edit", ar: "تعديل", en: "Edit",
      items: [
        { name: { ar: "بحث", en: "Find" }, kbd: "Ctrl+F", path: "Edit > Find", desc: { ar: "البحث عن أي عملية أو سجل جوه البرنامج بسرعة.", en: "Quickly search for any transaction or record inside the program." } }
      ]
    },
    {
      key: "Tasks", ar: "المهام", en: "Tasks",
      items: [
        { name: { ar: "أوامر البيع / عروض الأسعار", en: "Quotes/Sales Orders" }, path: "Tasks > Quotes/Sales Orders > Sales Orders", desc: { ar: "تسجيل طلب العميل لما يكون فيه فجوة زمنية بين الطلب والتسليم.", en: "Record the customer's order when there is a time gap between order and delivery." } },
        { name: { ar: "الفواصل والبيع الآجل", en: "Sales/Invoicing" }, path: "Tasks > Sales/Invoicing", desc: { ar: "إصدار فاتورة المبيعات للعميل اللي اشترى بالآجل، مع Apply to Sales Order أو Apply to Sales.", en: "Issue the sales invoice for credit customers, with Apply to Sales Order or Apply to Sales." } },
        { name: { ar: "المقبوضات", en: "Receipts" }, path: "Tasks > Receipts", desc: { ar: "تحصيل الكاش والشيكات من العملاء — Apply to Invoices أو Apply to Revenues.", en: "Collect cash and cheques from customers — Apply to Invoices or Apply to Revenues." } },
        { name: { ar: "تحديد للإيداع", en: "Select for Deposit" }, path: "Tasks > Select for Deposit", desc: { ar: "تجميع المقبوضات وإعداد قسيمة الإيداع البنكي.", en: "Gather receipts and prepare the bank deposit slip." } },
        { name: { ar: "أوامر الشراء", en: "Purchase Orders" }, path: "Tasks > Purchase Orders", desc: { ar: "إرسال طلب الشراء للمورد.", en: "Send the purchase order to the vendor." } },
        { name: { ar: "المشتريات / استلام المخزون", en: "Purchases/Receive Inventory" }, path: "Tasks > Purchases/Receive Inventory", desc: { ar: "تسجيل فاتورة المورد مع استلام البضاعة وتحديث المخزون.", en: "Record the vendor invoice while receiving goods and updating stock." } },
        { name: { ar: "المدفوعات", en: "Payments" }, path: "Tasks > Payments", desc: { ar: "سداد مستحقات الموردين — Apply to Invoices للفواتير، و Apply to Expenses للمصروفات المباشرة.", en: "Pay vendors — Apply to Invoices for invoices, Apply to Expenses for direct costs." } },
        { name: { ar: "إدخال الأجور", en: "Payroll Entry" }, path: "Tasks > Payroll Entry", desc: { ar: "اختر Employee ID فيستدعي البرنامج الساعات والمعدل ويحسب الخصومات والضرائب لصافي المرتب.", en: "Pick the Employee ID and the program pulls hours and rate, then nets out deductions and taxes." } }
      ]
    },
    {
      key: "Maintain", ar: "تهيئة", en: "Maintain",
      items: [
        { name: { ar: "العملاء", en: "Customers" }, path: "Maintain > Customers", desc: { ar: "تعريف بيانات العملاء الجدد وحدود الائتمان.", en: "Set up new customers and their credit limits." } },
        { name: { ar: "الموردون", en: "Vendors" }, path: "Maintain > Vendors", desc: { ar: "تعريف بيانات الموردين وشروط السداد.", en: "Set up vendors and their payment terms." } },
        { name: { ar: "أصناف المخزون", en: "Inventory Items" }, path: "Maintain > Inventory Items", desc: { ar: "تعريف الأصناف والوصف وطريقة التكلفة (FIFO) والحد الأدنى وحد إعادة الطلب.", en: "Define items, description, cost method (FIFO), min level and reorder point." } },
        { name: { ar: "الموظفون", en: "Employees" }, path: "Maintain > Employees", desc: { ar: "تعريف بيانات الموظفين ومعدلات الأجور.", en: "Define employee records and pay rates." } },
        { name: { ar: "دليل الحسابات", en: "Chart of Accounts" }, path: "Maintain > Chart of Accounts", desc: { ar: "قائمة كل حسابات الأستاذ العام اللي بتستخدمها المنشأة.", en: "The list of every general ledger account the entity uses." } }
      ]
    },
    {
      key: "Reports & Forms", ar: "التقارير", en: "Reports & Forms",
      items: [
        { name: { ar: "الذمم المدينة", en: "Accounts Receivable" }, path: "Reports & Forms > Accounts Receivable", desc: { ar: "تقارير فلوس العملاء — وأهمها تقرير أعمار الديون Aged Receivables.", en: "Customer money reports — above all the Aged Receivables report." } },
        { name: { ar: "أعمار الديون", en: "Aged Receivables" }, path: "Reports & Forms > Accounts Receivable > Aged Receivables", desc: { ar: "توزيع ديون العملاء حسب مدة التأخير، مع Filter و Display والطباعة والتصدير PDF.", en: "Customer debt split by days overdue, with Filter, Display, printing and PDF export." } }
      ]
    },
    {
      key: "Help", ar: "مساعدة", en: "Help",
      items: [
        { name: { ar: "عن البرنامج", en: "About" }, path: "Help > About", desc: { ar: "معلومات الإصدار والترخيص.", en: "Version and license information." } }
      ]
    }
  ];

  var MODULES = [
    { emoji: "🛒", name: { ar: "نظام المبيعات", en: "Sales Module" }, role: { ar: "استلام أوامر البيع من العملاء وإدارة حسابات العملاء والمدينين (Accounts Receivable).", en: "Receiving customer sales orders and managing accounts receivable." } },
    { emoji: "🚚", name: { ar: "المشتريات والمخزون", en: "Purchases & Inventory" }, role: { ar: "إعداد وتزويد الموردين بأوامر الشراء ومتابعة حركة المخزون.", en: "Preparing purchase orders for vendors and tracking inventory movement." } },
    { emoji: "🧑‍💼", name: { ar: "الموارد البشرية والأجور", en: "HR / Payroll Module" }, role: { ar: "الاحتفاظ ببيانات الموظفين وساعات العمل ومعدلات الأجور، وإعداد كشوف المرتبات والضرائب.", en: "Employee records, hours and pay rates; preparing payroll and withheld taxes." } },
    { emoji: "🏭", name: { ar: "الإنتاج والتصنيع", en: "Production Module" }, role: { ar: "تتبّع تدفق التكاليف خلال العملية التصنيعية.", en: "Tracking cost flow through the manufacturing process." } },
    { emoji: "🏗️", name: { ar: "الأصول الثابتة", en: "Asset Management" }, role: { ar: "تحديد تكاليف الأصول طويلة الأجل وأعمارها الإنتاجية وأماكن تواجدها.", en: "Costing long-term assets, their useful lives and their locations." } },
    { emoji: "💹", name: { ar: "الإدارة المالية", en: "Financial Management" }, role: { ar: "تتبّع الديون وجداول السداد وأسعار الفائدة وبيانات المساهمين.", en: "Tracking debts, payment schedules, interest rates and shareholder data." } },
    { emoji: "📚", name: { ar: "الأستاذ العام والتقارير", en: "General Ledger / Reports" }, role: { ar: "تزويد المساهمين والجهات التنظيمية بالمعلومات والقوائم المالية.", en: "Supplying shareholders and regulators with information and financial statements." } }
  ];

  var COMPONENTS = [
    { emoji: "👥", name: { ar: "الأفراد", en: "People" }, desc: { ar: "الكوادر البشرية المدربة على تشغيل النظام.", en: "The trained human staff who operate the system." } },
    { emoji: "📋", name: { ar: "الإجراءات", en: "Procedures" }, desc: { ar: "التعليمات والخطوات المتبعة لجمع وتجهيز البيانات.", en: "Instructions and steps for collecting and preparing data." } },
    { emoji: "🗂️", name: { ar: "البيانات", en: "Data" }, desc: { ar: "الحقائق والأحداث الاقتصادية والمالية الخاصة بالمنشأة.", en: "The entity's economic and financial facts and events." } },
    { emoji: "💽", name: { ar: "البرمجيات", en: "Software" }, desc: { ar: "التعليمات اللي توجه الحاسوب — زي Peachtree Complete Accounting و QuickBooks.", en: "Instructions that direct the computer — like Peachtree Complete Accounting and QuickBooks." } },
    { emoji: "🖥️", name: { ar: "الأجهزة والعتاد", en: "Hardware / IT" }, desc: { ar: "المكونات المادية والإلكترونية للحاسوب.", en: "The physical and electronic computer components." } }
  ];

  var INSTALL_STEPS = [
    { emoji: "💿", title: { ar: "تشغيل قرص التثبيت", en: "Launch the setup" }, desc: { ar: "إدخال الـ CD ليبدأ تلقائيًا، أو Start > Run وكتابة D:SETUP", en: "Insert the CD to auto-run, or Start > Run and type D:SETUP" } },
    { emoji: "📄", title: { ar: "اختيار خيار التثبيت", en: "Choose install option" }, desc: { ar: "اختيار Peachtree Accounting Install Option والموافقة على License Agreement", en: "Pick Peachtree Accounting Install Option and accept the License Agreement" } },
    { emoji: "🛡️", title: { ar: "استثناءات الحماية", en: "Security exceptions" }, desc: { ar: "السماح لجدار الحماية والأنتي فيرس بالاتصال واستثناء ملفات البرنامج حتى يكتمل التثبيت", en: "Allow Windows Firewall and antivirus to connect and whitelist program files until setup completes" } },
    { emoji: "🔢", title: { ar: "الرقم التسلسلي", en: "Serial number" }, desc: { ar: "إدخال الرقم التسلسلي المطبوع على غلاف القرص", en: "Enter the serial number printed on the disc sleeve" } },
    { emoji: "💻", title: { ar: "نوع التثبيت", en: "Installation type" }, desc: { ar: "اختيار Standalone / Single User والموافقة على حفظ بيانات الشركات على الجهاز", en: "Choose Standalone / Single User and agree to store company data on the machine" } },
    { emoji: "📁", title: { ar: "مسار الملفات", en: "Destination path" }, desc: { ar: "تحديد مسار ملفات البرنامج وبيانات الشركة أو ترك الافتراضي، ثم الضغط على Install", en: "Set the program and company data path (or keep default), then press Install" } },
    { emoji: "🎉", title: { ar: "إنهاء التثبيت", en: "Finish" }, desc: { ar: "عند Finish تظهر خيارات تشغيل البرنامج مباشرة أو عرض Release Notes", en: "At Finish you can run the program right away or read the Release Notes" } }
  ];

  var UNINSTALL_STEPS = [
    { emoji: "💾", title: { ar: "نسخة احتياطية", en: "Backup" }, desc: { ar: "أخذ نسخة احتياطية Backup من جميع بيانات الشركة", en: "Take a Backup of all company data" } },
    { emoji: "❌", title: { ar: "إغلاق البرنامج", en: "Close the program" }, desc: { ar: "إغلاق برنامج Peachtree كاملاً", en: "Close Peachtree completely" } },
    { emoji: "⚙️", title: { ar: "لوحة التحكم", en: "Control Panel" }, desc: { ar: "Control Panel > Add/Remove Programs أو Uninstall a Program", en: "Control Panel > Add/Remove Programs or Uninstall a Program" } },
    { emoji: "🗑️", title: { ar: "حذف البرنامج", en: "Remove the program" }, desc: { ar: "تحديد Peachtree > Change/Remove > Remove ثم الموافقة على التأكيد", en: "Select Peachtree > Change/Remove > Remove and confirm" } },
    { emoji: "⏳", title: { ar: "الانتظار والإنهاء", en: "Wait and finish" }, desc: { ar: "الانتظار حتى اكتمال الحذف ثم الضغط على Finish", en: "Wait for the deletion to complete, then press Finish" } }
  ];

  var LEDGER_INFO = {
    gl: { title: { ar: "دفتر الأستاذ العام", en: "General Ledger" }, desc: { ar: "بيعرض البيانات الملخصة لكل حساب: الأصول، الالتزامات، حقوق الملكية، الإيرادات، المصروفات.", en: "Summarized data for every account: assets, liabilities, equity, revenue, expenses." } },
    ar: { title: { ar: "دفتر مساعد العملاء", en: "A/R Subsidiary Ledger" }, desc: { ar: "يسجّل التفاصيل لكل عميل على حدة من اللي اشترى بالآجل — ادخل من مركز العملاء والمبيعات.", en: "Customer-by-customer detail of credit sales — open the Customers & Sales center." } },
    ap: { title: { ar: "دفتر مساعد الموردين", en: "A/P Subsidiary Ledger" }, desc: { ar: "يسجّل تفاصيل مشتريات البضائع بالآجل من كل مورد — ادخل من مركز الموردين والمشتريات.", en: "Credit purchase detail per vendor — open the Vendors & Purchases center." } },
    coa: { title: { ar: "دليل الحسابات", en: "Chart of Accounts" }, desc: { ar: "قائمة حصر شاملة بكل حسابات الأستاذ العام اللي المنشأة بتستخدمها.", en: "Comprehensive list of all general ledger accounts used by the entity." } }
  };

  var QUIZ = [
    {
      q: { ar: "بعد أمر المبيعات (Sales Order)، إيه الخطوة اللي بعدها في دورة البيع؟", en: "After a Sales Order, what is the next step in the sales cycle?" },
      opts: [
        { ar: "فاتورة المبيعات Sales Invoicing", en: "Sales Invoicing" },
        { ar: "أمر الشراء Purchase Order", en: "Purchase Order" },
        { ar: "سداد المستحقات Payments", en: "Payments" },
        { ar: "إدخال الأجور Payroll Entry", en: "Payroll Entry" }
      ],
      answer: 0
    },
    {
      q: { ar: "تحصيل الفلوس من العميل (كاش أو شيك) بيتسجل منين؟", en: "Collecting money from a customer (cash or cheque) is recorded where?" },
      opts: [
        { ar: "Maintain > Customers", en: "Maintain > Customers" },
        { ar: "Tasks > Receipts", en: "Tasks > Receipts" },
        { ar: "Tasks > Purchase Orders", en: "Tasks > Purchase Orders" },
        { ar: "Reports & Forms > Payroll", en: "Reports & Forms > Payroll" }
      ],
      answer: 1
    },
    {
      q: { ar: "إدارة المخزون (Inventory Items) بتتنفذ من قائمة إيه؟", en: "Managing Inventory Items runs from which menu?" },
      opts: [
        { ar: "Tasks", en: "Tasks" },
        { ar: "Reports & Forms", en: "Reports & Forms" },
        { ar: "Maintain", en: "Maintain" },
        { ar: "Edit", en: "Edit" }
      ],
      answer: 2
    },
    {
      q: { ar: "طريقة FIFO في تقييم المخزون معناها إيه؟", en: "The FIFO inventory valuation method means…" },
      opts: [
        { ar: "آخر حاجة داخلت تخرج الأولى", en: "Last in, first out" },
        { ar: "أول حاجة داخلت تخرج الأولى", en: "First in, first out" },
        { ar: "متوسط التكلفة المرجح", en: "Weighted average cost" },
        { ar: "الأعلى تكلفة يخرج أولاً", en: "Highest cost exits first" }
      ],
      answer: 1
    },
    {
      q: { ar: "تقرير أعمار الديون Aged Receivables بيُستخدم بشكل رئيسي لإيه؟", en: "The Aged Receivables report is mainly used to…" },
      opts: [
        { ar: "حساب مرتبات الموظفين", en: "Compute employee payroll" },
        { ar: "معرفة الديون المتأخرة على العملاء واتخاذ قرار التحصيل", en: "See overdue customer debt and decide on collection" },
        { ar: "تسجيل أوامر الشراء", en: "Record purchase orders" },
        { ar: "تحديد مسار تثبيت البرنامج", en: "Choose the install path" }
      ],
      answer: 1
    }
  ];

  var state = {
    salesStep: 0,
    buyStep: 0,
    payroll: 0,
    quiz: { i: 0, score: 0, chosen: -1, done: false, answers: [] },
    openMenu: -1,
    openCenter: -1
  };

  function applyLang() {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    $$("[data-ar]").forEach(function (n) {
      var v = lang === "ar" ? n.getAttribute("data-ar") : n.getAttribute("data-en");
      if (v !== null) n.innerHTML = v;
    });
    var lt = $("#langToggle");
    if (lt) lt.textContent = lang === "ar" ? "EN" : "ع";
    renderAll();
    try { localStorage.setItem("pt-lang", lang); } catch (e) {}
  }

  function renderAll() {
    renderStepper($("#salesStepper"), $("#salesDetail"), SALES_STEPS, "salesStep");
    renderStepper($("#buyStepper"), $("#buyDetail"), BUY_STEPS, "buyStep");
    renderPayroll();
    renderAged();
    renderMenus();
    renderCenters();
    renderModules();
    renderComponents();
    renderTimelines();
    renderQuiz();
  }

  function renderStepper(box, detailBox, steps, stateKey) {
    if (!box || !detailBox) return;
    box.innerHTML = "";
    steps.forEach(function (s, i) {
      var b = el("button", "step" + (state[stateKey] === i ? " active" : ""));
      b.type = "button";
      b.appendChild(el("span", "step-num", String(i + 1)));
      b.appendChild(el("span", "step-name", esc(t(s.name))));
      b.appendChild(el("span", "step-path", s.path.replace(/>/g, "›")));
      b.addEventListener("click", function () { state[stateKey] = i; renderAll(); });
      box.appendChild(b);
    });
    var s = steps[state[stateKey]];
    detailBox.innerHTML = "";
    detailBox.appendChild(el("div", "sd-title"));
    var titleEl = $(".sd-title", detailBox);
    titleEl.appendChild(document.createTextNode(t(s.name)));
    titleEl.appendChild(el("span", "sd-path", s.path));
    detailBox.appendChild(el("p", "sd-desc", esc(t(s.desc))));
    var ul = el("ul", "sd-notes");
    s.notes.forEach(function (n) { ul.appendChild(el("li", "", "<span>" + n[lang] + "</span>")); });
    detailBox.appendChild(ul);
  }

  var netTimer = null;
  function renderPayroll() {
    var picker = $("#payrollPicker");
    var slip = $("#payslip");
    if (!picker || !slip) return;
    picker.innerHTML = "";
    EMPLOYEES.forEach(function (e, i) {
      var b = el("button", "emp-btn" + (state.payroll === i ? " active" : ""));
      b.type = "button";
      b.appendChild(el("span", "emp-ava", e.ava));
      var wrap = el("span", "", esc(e.id + " — " + t(e.name)));
      b.appendChild(wrap);
      b.addEventListener("click", function () { state.payroll = i; renderAll(); });
      picker.appendChild(b);
    });
    var e = EMPLOYEES[state.payroll];
    var gross = e.hours * e.rate;
    var tax = Math.round(gross * 0.10);
    var ins = Math.round(gross * 0.04);
    var net = gross - tax - ins;
    slip.innerHTML = "";
    var h = el("h4", "ps-title", "🧾 " + (lang === "ar" ? "قسيمة مرتب تجريبية" : "Sample payslip"));
    slip.appendChild(h);
    function row(k, v) { slip.appendChild(el("div", "ps-row", "<span>" + esc(k) + "</span><b>" + v + "</b>")); }
    row(lang === "ar" ? "كود الموظف" : "Employee ID", esc(e.id));
    row(lang === "ar" ? "ساعات العمل" : "Hours worked", num(e.hours));
    row(lang === "ar" ? "معدل الأجر / ساعة" : "Rate per hour", num(e.rate) + " " + CUR());
    row(lang === "ar" ? "إجمالي الأجر" : "Gross pay", num(gross) + " " + CUR());
    row(lang === "ar" ? "خصم ضريبي ١٠٪" : "Tax 10%", "- " + num(tax) + " " + CUR());
    row(lang === "ar" ? "تأمينات ٤٪" : "Insurance 4%", "- " + num(ins) + " " + CUR());
    slip.appendChild(el("div", "ps-total", "<span>" + (lang === "ar" ? "صافي المرتب" : "Net pay") + "</span><b id='netVal'>0</b>"));
    slip.appendChild(el("p", "ps-flag", lang === "ar" ? "⚡ البرنامج حسب ده أوتوماتيك بمجرد اختيار Employee ID" : "⚡ The program computes this automatically once the Employee ID is picked"));
    if (netTimer) clearInterval(netTimer);
    var target = $("#netVal");
    var cur = 0;
    var stepV = Math.max(1, Math.round(net / 40));
    netTimer = setInterval(function () {
      cur += stepV;
      if (cur >= net) { cur = net; clearInterval(netTimer); }
      if (target) target.textContent = num(cur) + " " + CUR();
    }, 24);
  }

  function renderAged() {
    var box = $("#agedChart");
    if (!box) return;
    box.innerHTML = "";
    var max = Math.max.apply(null, AGED.map(function (a) { return a.amount; }));
    AGED.forEach(function (a) {
      var row = el("div", "aged-row");
      row.appendChild(el("span", "aged-label", esc(t(a.label))));
      var bar = el("div", "aged-bar");
      var fill = el("div", "aged-fill " + a.cls);
      fill.dataset.w = Math.round((a.amount / max) * 100) + "%";
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el("span", "aged-amount", num(a.amount)));
      box.appendChild(row);
      box.appendChild(el("p", "aged-note", esc(t(a.note))));
    });
    if (agedObs) agedObs.observe(box);
    animateAged();
  }

  function animateAged() {
    $$("#agedChart .aged-fill").forEach(function (f) {
      f.style.width = f.dataset.w;
    });
  }

  var agedObs = null;
  function renderMenus() {
    var bar = $("#mockMenubar");
    if (!bar) return;
    bar.innerHTML = "";
    MENUS.forEach(function (m, i) {
      var b = el("button", "menu-btn" + (state.openMenu === i ? " open" : ""), esc(t(m)));
      b.type = "button";
      b.setAttribute("data-i", i);
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        state.openMenu = state.openMenu === i ? -1 : i;
        renderMenus();
      });
      bar.appendChild(b);
    });
    if (state.openMenu >= 0 && MENUS[state.openMenu]) {
      var m = MENUS[state.openMenu];
      var drop = el("div", "menu-drop");
      m.items.forEach(function (it) {
        var b = el("button", "menu-item");
        b.type = "button";
        b.appendChild(el("span", "", esc(t(it.name))));
        if (it.kbd) b.appendChild(el("span", "kbd", it.kbd));
        b.addEventListener("click", function (ev) {
          ev.stopPropagation();
          showInfo(it);
          state.openMenu = -1;
          renderMenus();
        });
        drop.appendChild(b);
      });
      bar.appendChild(drop);
    }
  }

  function showInfo(it) {
    var box = $("#mockInfo");
    if (!box) return;
    box.innerHTML = "";
    var head = el("div", "mock-info-title");
    head.appendChild(document.createTextNode(t(it.name)));
    head.appendChild(el("span", "mock-info-path", it.path.replace(/>/g, "›")));
    box.appendChild(head);
    box.appendChild(el("p", "mock-info-desc", esc(t(it.desc))));
  }

  function renderCenters() {
    var box = $("#mockCenters");
    if (!box) return;
    box.innerHTML = "";
    CENTERS.forEach(function (c) {
      var b = el("button", "center");
      b.type = "button";
      b.appendChild(el("span", "", c.emoji));
      b.appendChild(el("span", "", esc(t(c))));
      box.appendChild(b);
    });
  }

  function renderModules() {
    var box = $("#modulesGrid");
    if (!box) return;
    box.innerHTML = "";
    MODULES.forEach(function (m) {
      var card = el("article", "flip-card reveal");
      card.innerHTML =
        '<div class="flip-inner">' +
        '<div class="flip-front"><div class="flip-ico">' + m.emoji + '</div><div class="flip-name">' + esc(t(m.name)) + '</div><div class="flip-en">' + esc(m.name[lang === "ar" ? "en" : "ar"]) + '</div><div class="flip-hint">' + (lang === "ar" ? "دوس يقلب 👆" : "click to flip 👆") + '</div></div>' +
        '<div class="flip-back"><p>' + esc(t(m.role)) + '</p></div>' +
        "</div>";
      card.addEventListener("click", function () { card.classList.toggle("flipped"); });
      box.appendChild(card);
      observeReveal(card);
    });
  }

  function renderComponents() {
    var box = $("#componentsGrid");
    if (!box) return;
    box.innerHTML = "";
    COMPONENTS.forEach(function (c) {
      var card = el("article", "card mini-card reveal");
      card.innerHTML =
        '<div class="mini-ico">' + c.emoji + '</div>' +
        "<h3>" + esc(t(c.name)) + "</h3>" +
        "<p>" + esc(t(c.desc)) + "</p>";
      box.appendChild(card);
      observeReveal(card);
    });
  }

  function renderTimelines() {
    drawTimeline($("#installTimeline"), INSTALL_STEPS);
    drawTimeline($("#uninstallTimeline"), UNINSTALL_STEPS);
  }

  function drawTimeline(list, steps) {
    if (!list) return;
    list.innerHTML = "";
    steps.forEach(function (s) {
      var li = el("li", "reveal");
      var ico = el("span", "tl-ico", s.emoji);
      var body = el("div", "tl-body");
      body.appendChild(el("div", "tl-title", esc(t(s.title))));
      body.appendChild(el("p", "tl-desc", esc(t(s.desc))));
      li.appendChild(ico);
      li.appendChild(body);
      list.appendChild(li);
      observeReveal(li);
    });
  }

  function renderQuiz() {
    var box = $("#quizBox");
    var res = $("#quizResult");
    if (!box || !res) return;
    box.hidden = false;
    res.hidden = true;
    var q = state.quiz;
    box.innerHTML = "";
    if (q.done) {
      box.hidden = true;
      res.hidden = false;
      res.innerHTML = "";
      var pct = Math.round((q.score / QUIZ.length) * 100);
      var emo = pct === 100 ? "🏆" : pct >= 60 ? "🎉" : "📚";
      res.appendChild(el("div", "quiz-result-emoji", emo));
      res.appendChild(el("h3", "", (lang === "ar" ? "نتيجتك: " : "Your score: ") + q.score + " / " + QUIZ.length));
      res.appendChild(el("p", "", pct === 100
        ? (lang === "ar" ? "كامل العدد! الدكتورة هتفتخر بيك 👏" : "Perfect score! Your professor would be proud 👏")
        : pct >= 60
        ? (lang === "ar" ? "كويس جدًا — راجع الكوميك كمان مرة وهتبقى ١٠٠٪." : "Nice work — revisit the comic once more and you'll hit 100%.")
        : (lang === "ar" ? "ماشي، راجع المهام الخمس تاني وجرب الكويز من جديد 💪" : "Not bad — review the five tasks and retry the quiz 💪")));
      var again = el("button", "quiz-next", lang === "ar" ? "إعادة الكويز 🔄" : "Retry quiz 🔄");
      again.type = "button";
      again.addEventListener("click", function () {
        state.quiz = { i: 0, score: 0, chosen: -1, done: false, answers: [] };
        renderQuiz();
      });
      res.appendChild(again);
      if (pct >= 60) confettiBurst();
      return;
    }
    var item = QUIZ[q.i];
    var chosen = q.answers[q.i];
    var head = el("div", "q-head");
    head.appendChild(el("span", "q-num", (lang === "ar" ? "سؤال " : "Q ") + (q.i + 1) + "/" + QUIZ.length));
    head.appendChild(el("span", "q-text", esc(t(item.q))));
    box.appendChild(head);
    var opts = el("div", "q-opts");
    item.opts.forEach(function (o, i) {
      var b = el("button", "opt" + (chosen !== undefined ? (i === item.answer ? " correct" : (i === chosen ? " wrong" : "")) : ""));
      b.type = "button";
      b.appendChild(el("span", "", esc(t(o))));
      if (chosen !== undefined) b.disabled = true;
      else b.addEventListener("click", function () {
        q.answers[q.i] = i;
        if (i === item.answer) { q.score++; confettiBurst(28); }
        renderQuiz();
      });
      opts.appendChild(b);
    });
    box.appendChild(opts);
    if (chosen !== undefined) {
      var nxt = el("button", "quiz-next", q.i < QUIZ.length - 1 ? (lang === "ar" ? "السؤال التالي →" : "Next question →") : (lang === "ar" ? "شوف النتيجة 🎉" : "See result 🎉"));
      nxt.type = "button";
      nxt.addEventListener("click", function () {
        if (q.i < QUIZ.length - 1) q.i++;
        else q.done = true;
        renderQuiz();
      });
      box.appendChild(nxt);
    }
  }

  var revealObs = null;
  function observeReveal(node) {
    if (revealObs) revealObs.observe(node);
    else node.classList.add("visible");
  }

  function initObserver() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach(function (n) { n.classList.add("visible"); });
      return;
    }
    revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); revealObs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    $$(".reveal").forEach(function (n) { revealObs.observe(n); });

    agedObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateAged(); agedObs.unobserve(en.target); }
      });
    }, { threshold: 0.35 });
  }

  var typedTimer = null;
  function startTyping() {
    var host = $("#typed");
    if (!host) return;
    var phrases = lang === "ar"
      ? ["المهام المحاسبية الخمس الرئيسية 🧮", "شرح عملي لبرنامج Peachtree (Sage 50) 🍑", "بيع · شراء · أجور · مخزون · تقارير 📊"]
      : ["The Five Core Accounting Tasks 🧮", "A hands-on Peachtree (Sage 50) lecture 🍑", "Sell · Buy · Pay · Stock · Report 📊"];
    var pi = 0, ci = 0, del = false;
    if (typedTimer) clearInterval(typedTimer);
    typedTimer = setInterval(function () {
      var p = phrases[pi];
      ci += del ? -1 : 1;
      host.textContent = p.slice(0, ci);
      if (!del && ci === p.length) { del = true; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
      else if (del) { /* hold */ }
      if (del && ci === p.length) { /* pause handled next ticks */ }
    }, lang === "ar" ? 90 : 70);
  }

  var cc = $("#confetti");
  var cx = cc ? cc.getContext("2d") : null;
  var parts = [];
  var COLORS = ["#FF8C42", "#2E7D5B", "#FFC53D", "#2BB3A3", "#E8552D", "#8E44AD"];
  function sizeCanvas() {
    if (!cc) return;
    cc.width = window.innerWidth;
    cc.height = window.innerHeight;
  }
  function confettiBurst(count) {
    if (!cx) return;
    var n = count || 90;
    for (var i = 0; i < n; i++) {
      parts.push({
        x: window.innerWidth / 2 + (Math.random() - 0.5) * 240,
        y: window.innerHeight * 0.32,
        vx: (Math.random() - 0.5) * 13,
        vy: Math.random() * -14 - 4,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 10,
        c: COLORS[i % COLORS.length],
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.4,
        life: 90 + Math.random() * 60
      });
    }
    if (parts.length && !confettiRunning) loopConfetti();
  }
  var confettiRunning = false;
  function loopConfetti() {
    confettiRunning = true;
    if (!cx) return;
    cx.clearRect(0, 0, cc.width, cc.height);
    parts = parts.filter(function (p) { return p.life > 0; });
    parts.forEach(function (p) {
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life--;
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.r);
      cx.fillStyle = p.c;
      cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    });
    if (parts.length) requestAnimationFrame(loopConfetti);
    else { confettiRunning = false; cx.clearRect(0, 0, cc.width, cc.height); }
  }

  function initUI() {
    var bar = $("#scrollBar");
    var toTop = $("#toTop");
    window.addEventListener("scroll", function () {
      var h = document.documentElement;
      var pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      if (bar) bar.style.width = pct + "%";
      if (toTop) toTop.classList.toggle("show", h.scrollTop > 500);
      spy();
    }, { passive: true });

    if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

    var ham = $("#hamburger");
    var links = $("#navLinks");
    if (ham && links) {
      ham.addEventListener("click", function () { links.classList.toggle("open"); });
      $$("a", links).forEach(function (a) { a.addEventListener("click", function () { links.classList.remove("open"); }); });
    }

    var lt = $("#langToggle");
    if (lt) lt.addEventListener("click", function () {
      lang = lang === "ar" ? "en" : "ar";
      applyLang();
      startTyping();
    });

    var tt = $("#themeToggle");
    function setThemeIcon() { if (tt) tt.textContent = theme === "dark" ? "☀️" : "🌙"; }
    if (tt) tt.addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", theme);
      setThemeIcon();
      try { localStorage.setItem("pt-theme", theme); } catch (e) {}
    });
    setThemeIcon();

    document.addEventListener("click", function () {
      if (state.openMenu !== -1) { state.openMenu = -1; renderMenus(); }
    });

    var tabI = $("#tabInstall"), tabU = $("#tabUninstall");
    var tlI = $("#installTimeline"), tlU = $("#uninstallTimeline");
    function showTab(which) {
      if (!tabI || !tabU || !tlI || !tlU) return;
      var isInstall = which === "i";
      tabI.classList.toggle("active", isInstall);
      tabU.classList.toggle("active", !isInstall);
      tlI.hidden = !isInstall;
      tlU.hidden = isInstall;
      $$("li", isInstall ? tlI : tlU).forEach(function (n) { n.classList.add("visible"); });
    }
    if (tabI) tabI.addEventListener("click", function () { showTab("i"); });
    if (tabU) tabU.addEventListener("click", function () { showTab("u"); });

    $$(".ledger-node").forEach(function (g) {
      g.addEventListener("click", function () {
        $$(".ledger-node").forEach(function (x) { x.classList.remove("selected"); });
        g.classList.add("selected");
        var info = LEDGER_INFO[g.getAttribute("data-node")];
        var box = $("#ledgerInfo");
        if (info && box) {
          box.innerHTML = "";
          var head = el("div", "mock-info-title");
          head.appendChild(document.createTextNode(t(info.title)));
          box.appendChild(head);
          box.appendChild(el("p", "mock-info-desc", esc(t(info.desc))));
        }
      });
    });

    sizeCanvas();
    window.addEventListener("resize", function () { sizeCanvas(); });
  }

  var sectionIds = ["intro", "tasks", "comic", "simulator", "modules", "install", "ledgers", "quiz"];
  function spy() {
    var pos = window.scrollY + 120;
    var current = "";
    sectionIds.forEach(function (id) {
      var s = document.getElementById(id);
      if (s && s.offsetTop <= pos) current = id;
    });
    $$(".nav-links a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }

  document.documentElement.setAttribute("data-theme", theme);
  initObserver();
  initUI();
  applyLang();
  startTyping();
  spy();

  if (window.innerWidth > 860) {
    var hero = $(".hero");
    var blobs = $$(".blob");
    if (hero) {
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        blobs.forEach(function (b, i) {
          var d = (i + 1) * 14;
          b.style.translate = (x * d) + "px " + (y * d) + "px";
        });
      });
    }
    $$(".task-card, .comic-panel, .flip-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(700px) rotateX(" + (-y * 3) + "deg) rotateY(" + (x * 3) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }
})();
