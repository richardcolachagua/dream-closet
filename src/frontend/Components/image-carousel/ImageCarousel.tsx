import React from 'react';

interface CarouselProps {
    images : Array<string>
}

export const ImageCarousel = (props: CarouselProps) => {

    return (
    <div>
    {props.images.map((image) => <img src={image}></img>)}
    </div>
    )

}