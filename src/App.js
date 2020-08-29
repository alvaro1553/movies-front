import React, {useState, useContext} from 'react';
import './App.css';
import User from './models/User.js';
import * as api from './routes/user.router';
import {getAllMovies, getMovieComments, postMovieComment} from "./routes/movies.router";

function App() {
    let [isLoggedIn, setIsLoggedIn] = useState(false);
    let [signUpRequested, setSignUpRequested] = useState(false);
    if (isLoggedIn) return <MainPanel user={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>;
    else if (!signUpRequested) return <LogIn setIsLoggedIn={setIsLoggedIn} setSignUpRequested={setSignUpRequested}/>;
    else return <SignUp setIsLoggedIn={setIsLoggedIn} setIsLoggedIn={setIsLoggedIn}/>;
}

function MainPanel(props){
    let user = props.user;
    const setIsLoggedIn = props.setIsLoggedIn;
    const [movies, setMovies] = React.useState(null);
    const [selectedMovie, setSelectedMovie] = React.useState(null);

    React.useEffect(()=>{
        loadAllMovies();
    },[])

    const loadAllMovies = ()=>{
        getAllMovies().then((movies)=> {
            setMovies(movies);
        }).catch((err)=>{
            console.log(err)
        });
    }

    const logOut = ()=>{
       setIsLoggedIn(false);
    }

    return (
        <>
            <button type='button' onClick={logOut}>Log out</button>
            <h3>You have successfully log in as: {user.email}</h3>
            <div className={'panel'}>
            {movies ?
                <MoviesCatalog
                    movies={movies}
                    setSelectedMovie={setSelectedMovie}
                    loadMovies={loadAllMovies}
                /> :
                <p>Loading movies...</p>
            }
            {selectedMovie?
                <CommentsEditor
                    selectedMovie={selectedMovie} user={user}
                    loadMovies={loadAllMovies()}
                /> : ''
            }
            </div>
        </>
    )

}

function MoviesCatalog(props){
    const {movies, setSelectedMovie, loadMovies} = props;
    const movieClick = async (movie)=>{
           setSelectedMovie(movie)
    }
    return (
        <div>
        <button type='button' onClick={loadMovies}>refresh</button>
        <table className='table'>
            <caption>List of movies</caption>
            <thead>
            <tr>
                <th>Title</th>
                <th>Released</th>
                <th>Director</th>
                <th>Rating of users</th>
            </tr>
            </thead>
            <tbody>
            { movies.map((movie)=>{
                return (
                <tr key={movie.id} onClick={movieClick.bind(this, movie)}>
                    <td>{movie.title}</td>
                    <td>{movie.date}</td>
                    <td>{movie.director}</td>
                    <td>{ movie.rating_avg ? parseFloat(movie.rating_avg).toFixed(2) : 'No ratings yet' }</td>
                </tr>
                )
            }) }
            </tbody>
        </table>
        </div>
    )
}

function CommentsEditor(props){
    const {selectedMovie: movie, user, loadMovies} = props;
    const [comments, setComments] = React.useState([]);

    React.useEffect(()=>{
        loadComments().then();
    },[movie])

    const loadComments = ()=>{
        return getMovieComments(movie.id).then((comments)=> {
            setComments(comments);
        }).catch((err)=>{
        });
    }

    return (
        <div>
        <table className='table'>
            <caption>Title: movie.title</caption>
            <thead>
            <tr>
                <th>Comment</th>
                <th>Rating</th>
                <th>Email</th>
            </tr>
            </thead>
            <tbody>
            { comments.map((comment, index)=>{
                return (
                    <tr key={index} >
                        <td>{comment.comment}</td>
                        <td>{comment.rating}</td>
                        <td>{comment.email}</td>
                    </tr>
                )
            }) }
            </tbody>
        </table>
        <CommentForm user={user} movie={movie} loadComments={loadComments}
        loadMovies={loadMovies}/>
        </div>
    )
}

function CommentForm(props){
    const {user, movie, loadComments, loadMovies} = props;
    const [inputComment, setInputComment] = useState("")
    const [inputRange, setInputRange] = useState(0)

    const onSubmit= (e)=> {
        e.preventDefault();
        let comment = {
            useremail: user.email,
            movieid: movie.id,
            comment: inputComment,
            rating: inputRange
        }
        postMovieComment(comment).then(
            loadComments
        )
        setInputComment('');
        setInputRange(0);
    }

    return (
        <form onSubmit={onSubmit}>
            <input type="text" name="comment" placeholder="Comment:" value={inputComment} onChange={(e)=>setInputComment(e.target.value)}/>
            <input type="range" name="rating" min="0" max="5" placeholder="Rating:" value={inputRange} onChange={(e)=>setInputRange(e.target.value)}/>
            <input type="submit" name="submit" value="Send review"/>
        </form>
    )

}

function LogIn(props){
    //Todo: render on log in
    const [inputEmail, setInputEmail] = useState("")
    const [inputPass, setInputPass] = useState("")
    const [informErrorUser, setInformErrorUser] = useState(null)

    const onSubmitLogIn = (e)=> {
        // Prevent browser default
        e.preventDefault();
        // Validation: no empty fields
        if( !inputEmail || !inputPass ){
            setInformErrorUser('Please insert email and pass')
            return false;
        }
        // Create new user
        let user = new User();
        user.email = inputEmail;
        user.generateSecret(inputPass);
        // Check user with DB
        api.checkUser(user).then((serverResponse)=>{
            if (serverResponse == 'User access granted') {
                props.setIsLoggedIn(user);
            }
            setInformErrorUser(serverResponse)
        });
    }

    const onClickSignUp = (e)=>{
        props.setSignUpRequested(true);
    }

    return (
        <form onSubmit={onSubmitLogIn}>
            <input type="text" name="email" placeholder="Email:" value={inputEmail} onChange={(e)=>setInputEmail(e.target.value)}/>
            <input type="text" name="pass" placeholder="Password:" value={inputPass} onChange={(e)=>setInputPass(e.target.value)}/>
            <input type="submit" name="submit" value="Log In"/>
            <button type="button" onClick={onClickSignUp}>Sign Up</button>
            { informErrorUser ? <p style={{color: 'red'}}>{informErrorUser}</p> : '' }
        </form>
    )
}

function SignUp(props){
    const [inputEmail, setInputEmail] = useState(null)
    const [inputPass1, setInputPass1] = useState(null)
    const [inputPass2, setInputPass2] = useState(null)
    const [areDifferent, setAreDifferent] = useState(false)
    const [isCreated, setIsCreated] = useState(false)

    const onSubmitSignUp = async (e)=> {
        e.preventDefault();
        if (inputPass1 != inputPass2){
            setAreDifferent(true);
            return null; }
        let user = new User();
        user.email = inputEmail;
        user.generateSecret(inputPass1);
        await api.postUser(user);
        setIsCreated(true);
        props.setIsLoggedIn(false);
    }

    return (
        <form onSubmit={onSubmitSignUp}>
            <input type="text" name="email" placeholder="Email*:" value={inputEmail} onChange={(e)=>setInputEmail(e.target.value)}/>
            <input type="text" name="pass1" placeholder="Password*:" value={inputPass1} onChange={(e)=>setInputPass1(e.target.value)}/>
            <input type="text" name="pass2" placeholder="Password*:" value={inputPass2} onChange={(e)=>setInputPass2(e.target.value)}/>
            <input type="submit" name="submit" value="Sign Up"/>
            { areDifferent ? <p style={{color: 'red'}}>Passwords are different</p> : '' }
            { isCreated ? <p style={{color: 'green'}}>User created</p> : '' }
        </form>
    )
}

export default App;
