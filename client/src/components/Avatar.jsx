const Avatar = (props) => {
    const colors = [
        'bg-teal-200', 'bg-blue-200',
        'bg-red-200', 'bg-yellow-200',
        'bg-green-200', 'bg-purple-200'
    ]

    const color = colors[parseInt(props.userID,10) % colors.length];

    return (
        <div className={'w-9 h-9 bg-teal-300 rounded-full flex items-center ' + color}>
            <div className='text-center w-full opacity-70'>{props.username[0]}</div>
        </div>
    );
}

export default Avatar;