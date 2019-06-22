import React from 'react';
import logo from './logo.svg';
import './App.css';

import Image from 'react-jimage'
// import Image from './components/Imager'

const images = [
  'https://i.imgur.com/KLSeYst.jpg',
  'https://o.aolcdn.com/images/dims?quality=85&image_uri=https%3A%2F%2Fs.aolcdn.com%2Fhss%2Fstorage%2Fmidas%2Ff9a826432b80d8944e724cd6e2df38ec%2F206210712%2Fgamingtv-ed.jpg&client=amp-blogside-v2&signature=d4a1f59340256526f68e0433cd9af59e28b53b32',
  'https://cdn.vox-cdn.com/thumbor/ix4uTa1lYoJKRH0XCG5Rl-yRQrQ=/0x0:1600x900/1200x800/filters:focal(672x322:928x578)/cdn.vox-cdn.com/uploads/chorus_image/image/63897928/ps4_controller_8.0.jpg'
]


function App() {

  const [ loader, toggleLoader ] = React.useState(true)
  const [ index, setIndex ] = React.useState(0)
  const [ code, setCode ] = React.useState('')
  const [ refresh, setRefresh ] = React.useState(false)

  const handleToggle = () => {
    setRefresh(true)
    toggleLoader(!loader)
    setTimeout(() => {
      setRefresh(false)
    }, 200)
  }

  // React.useEffect(() => {
  //   setTimeout(() => {
  //     setIndex(index+1 === images.length ? 0 : index+1)
  //   },5000)
  // },[ index ])

  return (
    <div className="App">

      <h1>React JiMage</h1>
      <p>pan and zoom images in the container.</p>

      <div style={{marginBottom: 21}}>
        <b>{loader ? 'with loader' : 'without loader'}</b> &nbsp;
        <a href="javascript:;" onClick={handleToggle}>Toggle</a>
      </div>

      <div className="container">
        { refresh ? null : <Image image={images[index]} preloader={
          loader ?
            <i>Loading... Styling is up to you..</i> :
            null
        } /> }
      </div>

      <p>zoom with mousewheel, pan with your mouse.<br />
      <b>Touch-enabled</b> for drag and pinch gesture.</p>
      <br /><br />
    </div>
  );
}

export default App;
