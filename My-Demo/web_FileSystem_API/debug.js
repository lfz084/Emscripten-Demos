const commands = {
  test: function() {
    console.log(handle)
    delete handle;
    console.log(handle)
  }
}

const buttons = [{
  id: "01",
  innerText: "open",
  onclick: async function() {
    handle = (await showOpenFilePicker())[0]
  }
}, {
  id: "02",
  innerText: "test",
  onclick: commands.test
}]

var handle;