import './App.css'
import './NamazonUI.css'
import NamazonMasterUI from "./NamazonUI";
import backGround from "./images/MandelbrotSet.jpg";


function App() {
    return (
        <body className="App" style={{backgroundImage:`url(${backGround})`}}>
            <NamazonMasterUI className="MasterComponent"/>
        </body>
    )
}

export default App;
