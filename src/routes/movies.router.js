
export async function getAllMovies(){
    return fetch('/movies')
        .then(response => response.json())
}

export async function getMovieComments(id){
    return fetch(`/movies/${id}`)
        .then(response => response.json())
}

export async function postMovieComment(comment){
    return fetch(`/movies/${comment.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(comment)
    })
        .then(response => response.text())
}
