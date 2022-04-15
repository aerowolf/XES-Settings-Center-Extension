const Gtk = imports.gi.Gtk;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const MenuItems = Extension.imports.menu_items;

const schema = "org.gnome.shell.extensions.SettingsCenter";

function init() {}

function buildPrefsWidget() {
  let prefs = new Prefs(schema);

  return prefs.buildPrefsWidget();
}

function Prefs(schema) {
  this.init(schema);
}

Prefs.prototype = {
  settings: null,
  menuItems: null,

  vboxList: null,
  hboxsList: new Array(),

  init: function (schema) {
    this.settings = ExtensionUtils.getSettings(schema);

    this.menuItems = new MenuItems.MenuItems(this.settings);
  },

  changeMenu: function (text) {
    this.settings.set_string("label-menu", text.text);
  },

  changeEnable: function (index, valueList) {
    this.menuItems.changeEnable(index, Number(valueList.active));
  },

  addCmd: function (label, cmd) {
    this.menuItems.addItem(label.text, cmd.text);

    label.text = "";
    cmd.text = "";

    this.buildList();
  },

  changeOrder: function (index, order) {
    this.menuItems.changeOrder(index, order);

    this.buildList();
  },

  delCmd: function (index) {
    this.menuItems.delItem(index);

    this.buildList();
  },

  buildList: function () {
    for (let indexHboxsList in this.hboxsList)
      this.vboxList.remove(this.hboxsList[indexHboxsList]);
    this.hboxsList = new Array();

    let items = this.menuItems.getItems();

    for (let indexItem in items) {
      let item = items[indexItem];

      let hboxList = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 12,
      });
      let labelList = new Gtk.Label({ label: item["label"], xalign: 0 });

      let buttonUp = new Gtk.Button({ label: "Up" });
      if (indexItem > 0)
        buttonUp.connect("clicked", this.changeOrder.bind(this, indexItem, -1));

      let buttonDown = new Gtk.Button({ label: "Down" });
      if (indexItem < items.length - 1)
        buttonDown.connect(
          "clicked",
          this.changeOrder.bind(this, indexItem, 1)
        );

      let valueList = new Gtk.Switch({ active: item["enable"] == "1" });
      valueList.connect(
        "notify::active",
        this.changeEnable.bind(this, indexItem, valueList)
      );

      let buttonDel = null;
      if (items.length > 1) {
        buttonDel = new Gtk.Button({ label: "Del", margin_start: 10 });
        buttonDel.connect("clicked", this.delCmd.bind(this, indexItem));
      }

      hboxList.prepend(labelList);

      hboxList.append(valueList);
      hboxList.append(buttonUp);
      hboxList.append(buttonDown);

      if (buttonDel != null) hboxList.append(buttonDel);
      this.vboxList.append(hboxList);

      this.hboxsList.push(hboxList);
    }

    //	this.vboxList.show_all();
  },

  buildPrefsWidget: function () {
    let frame = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 12,
    });

    let label = new Gtk.Label({
      label: "<b>Global</b>",
      use_markup: true,
      xalign: 0,
    });
    let vbox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 12,
      margin_start: 20,
    });

    let hboxMenu = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 12,
    });
    let labelMenu = new Gtk.Label({ label: "Menu Label", xalign: 0 });
    let valueMenu = new Gtk.Entry({ hexpand: true });
    valueMenu.set_text(this.settings.get_string("label-menu"));
    let buttonMenu = new Gtk.Button({ label: "Apply" });

    buttonMenu.connect("clicked", this.changeMenu.bind(this, valueMenu));

    hboxMenu.prepend(labelMenu);
    hboxMenu.append(valueMenu);
    hboxMenu.append(buttonMenu);
    vbox.append(hboxMenu);

    frame.append(label);
    frame.append(vbox);

    vbox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 12,
      margin_start: 20,
    });

    frame.append(vbox);

    label = new Gtk.Label({
      label: "<b>Menu Items</b>",
      use_markup: true,
      xalign: 0,
    });
    this.vboxList = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 12,
      margin_start: 20,
    });

    this.buildList();

    frame.append(label);
    frame.append(this.vboxList);

    label = new Gtk.Label({
      label: "<b>Add Menu</b>",
      use_markup: true,
      xalign: 0,
    });
    vbox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 12,
      margin_start: 20,
    });

    let hboxLabelAdd = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 12,
    });
    let labelLabelAdd = new Gtk.Label({ label: "Label", xalign: 0 });
    let valueLabelAdd = new Gtk.Entry({ hexpand: true });

    hboxLabelAdd.prepend(labelLabelAdd);
    hboxLabelAdd.append(valueLabelAdd);
    vbox.append(hboxLabelAdd);

    let hboxCmdAdd = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 12,
    });
    let labelCmdAdd = new Gtk.Label({ label: "Command", xalign: 0 });
    let valueCmdAdd = new Gtk.Entry({ hexpand: true });

    hboxCmdAdd.prepend(labelCmdAdd);
    hboxCmdAdd.append(valueCmdAdd);
    vbox.append(hboxCmdAdd);

    let hboxButtonAdd = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 12,
    });
    let buttonAdd = new Gtk.Button({ label: "Add" });
    buttonAdd.connect(
      "clicked",
      this.addCmd.bind(this, valueLabelAdd, valueCmdAdd)
    );

    hboxButtonAdd.append(buttonAdd);
    vbox.append(hboxButtonAdd);

    frame.append(label);
    frame.append(vbox);

    //	frame.show_all();

    return frame;
  },
};
