import React from 'react';

const ListItem = (props) => (
  	<div className="yelp-list-entry-container" onClick={(e)=> props.handleClick(props.item, props.listKey)}>
	    <div className="yelp-list-entry">
	        <div className="media-left media-middle">
	          <img className="listing-object" src={props.item.image_url} alt="" />
	         </div>
	        <div className="listing-body">
	          <a href={props.item.url} target="blank"><div className="yelp-list-entry-name" >
              {props.listKey+1 + '. ' + props.item.name}
            </div></a>

	          <div className="yelp-list-entry-rating">{props.item.rating}/5</div>
            <div className="yelp-list-entry-price">{props.item.price}</div>
	        	<div className="yelp-list-entry-reviews">{props.item.review_count} Reviews</div>
	        </div>
	        <div className="yelp-list-entry-address">
	          	<div className="yelp-list-entry-address1">{props.item.location.address1}</div>
	          	<div className="yelp-list-entry-city">{props.item.location.city + ', ' + props.item.location.zip_code}</div>
	          	<div className="yelp-list-entry-phone">{props.item.phone}</div>
              <svg 
                className={`favorite-icon ${props.favorited ? 'favorite-active' : ''}`} 
                viewBox="0 0 32 32" 
                fill="#000" 
                fillOpacity="0.5" 
                stroke="#ffffff" 
                strokeWidth="1.5" 
                aria-label="Save to Wish List" 
                role="img" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                onClick={(e) => props.handleFavoriteClick(props.item, props.favorited)}>
                <path d="M23.993 2.75c-.296 0-.597.017-.898.051-1.14.131-2.288.513-3.408 1.136-1.23.682-2.41 1.621-3.688 2.936-1.28-1.316-2.458-2.254-3.687-2.937-1.12-.622-2.268-1.004-3.41-1.135a7.955 7.955 0 0 0-.896-.051C6.123 2.75.75 4.289.75 11.128c0 7.862 12.238 16.334 14.693 17.952a1.004 1.004 0 0 0 1.113 0c2.454-1.618 14.693-10.09 14.693-17.952 0-6.84-5.374-8.378-7.256-8.378"></path>
              </svg>
	        </div>
	      </div>
      </div>
);

export default ListItem;