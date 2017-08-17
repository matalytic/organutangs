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
	        </div>
	      </div>
      </div>
);

export default ListItem;