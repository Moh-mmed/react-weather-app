import error from "../imgs/error.png"
import "../styles/Error.css"
function Error({ message }) {

  return (
    <div className='main'>
      <img src={error} alt="error"/>
      {message ? <p>{message}</p> : null}
    </div>
  )
}

export default Error
